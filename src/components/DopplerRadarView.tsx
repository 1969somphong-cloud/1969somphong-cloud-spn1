import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Wind, 
  CloudRain, 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  AlertTriangle 
} from 'lucide-react';
import { CurrentWeather, LocationItem, StormCell } from '../types/weather';

interface DopplerRadarViewProps {
  location: LocationItem;
  currentWeather: CurrentWeather;
  isSimulatedStorm?: boolean;
}

export const DopplerRadarView: React.FC<DopplerRadarViewProps> = ({
  location,
  currentWeather,
  isSimulatedStorm = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeOffsetMinutes, setTimeOffsetMinutes] = useState<number>(0); // -120 to +60
  const [activeLayer, setActiveLayer] = useState<'dBZ' | 'wind' | 'combined'>('combined');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoverData, setHoverData] = useState<{ x: number; y: number; dbz: number; mmh: number; distKm: number } | null>(null);

  // Generate deterministic/seedable storm cells near this location based on weather conditions
  const stormCells = useMemo<StormCell[]>(() => {
    const hasRain = currentWeather.precipitation > 0 || [61, 63, 65, 80, 81, 82, 95, 96, 99].includes(currentWeather.weatherCode) || isSimulatedStorm;
    const baseIntensity = isSimulatedStorm ? 58 : (currentWeather.precipitation * 3.5) + (currentWeather.weatherCode === 95 ? 45 : 20);
    const cells: StormCell[] = [];

    if (hasRain) {
      cells.push({
        id: 'cell-alpha',
        lat: location.lat + 0.15,
        lon: location.lon - 0.1,
        intensityDbz: Math.min(65, Math.max(25, baseIntensity)),
        headingDeg: (currentWeather.windDirection + 180) % 360,
        speedKmH: Math.max(15, currentWeather.windSpeed),
        type: baseIntensity > 50 ? 'พายุฟ้าผ่ารุนแรง (Severe)' : 'กลุ่มฝนฟ้าคะนอง (Thunderstorm)'
      });

      cells.push({
        id: 'cell-beta',
        lat: location.lat - 0.22,
        lon: location.lon + 0.18,
        intensityDbz: Math.min(60, Math.max(20, baseIntensity * 0.8)),
        headingDeg: (currentWeather.windDirection + 195) % 360,
        speedKmH: Math.max(12, currentWeather.windSpeed * 0.9),
        type: 'กลุ่มเมฆฝนกระจายตัว (Rain Band)'
      });

      if (isSimulatedStorm || baseIntensity > 40) {
        cells.push({
          id: 'cell-gamma',
          lat: location.lat + 0.05,
          lon: location.lon + 0.25,
          intensityDbz: Math.min(68, Math.max(30, baseIntensity * 1.1)),
          headingDeg: (currentWeather.windDirection + 170) % 360,
          speedKmH: currentWeather.windSpeed * 1.1,
          type: 'พายุลมกระโชกแรง/ลูกเห็บ (Gale/Hail)'
        });
      }
    } else {
      // Light scattered clouds
      cells.push({
        id: 'cell-light',
        lat: location.lat + 0.35,
        lon: location.lon + 0.2,
        intensityDbz: 18,
        headingDeg: currentWeather.windDirection,
        speedKmH: 14,
        type: 'เมฆประปราย (Scattered)'
      });
    }

    return cells;
  }, [location, currentWeather, isSimulatedStorm]);

  // Animation ticker for radar scan and timeline playback
  useEffect(() => {
    let animId: number;
    let sweepAngle = 0;
    let particleOffset = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Update sweep beam
      sweepAngle = (sweepAngle + dt * 1.8) % (Math.PI * 2);
      particleOffset = (particleOffset + dt * 45) % 1000;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = (Math.min(width, height) / 2 - 25) * zoomLevel;

      // Clear dark meteorological slate
      ctx.fillStyle = '#060d17';
      ctx.fillRect(0, 0, width, height);

      // Radar Concentric Distance Rings
      const rings = [50, 100, 150, 200, 250]; // km
      ctx.save();
      rings.forEach((km, idx) => {
        const r = (km / 250) * maxRadius;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === rings.length - 1 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Distance label
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`${km} km`, centerX + 6, centerY - r + 12);
      });

      // Azimuth radial lines
      for (let deg = 0; deg < 360; deg += 45) {
        const rad = (deg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(rad) * maxRadius, centerY + Math.sin(rad) * maxRadius);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Direction text
        const labelR = maxRadius + 15;
        const labels: Record<number, string> = { 0: 'N (0°)', 45: 'NE', 90: 'E (90°)', 135: 'SE', 180: 'S (180°)', 225: 'SW', 270: 'W (270°)', 315: 'NW' };
        if (labels[deg]) {
          ctx.fillStyle = deg === 0 ? '#38bdf8' : 'rgba(148, 163, 184, 0.7)';
          ctx.font = '10px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labels[deg], centerX + Math.cos(rad) * labelR, centerY + Math.sin(rad) * labelR);
        }
      }

      // Render Storm Reflectivity Cells (Doppler Echoes)
      if (activeLayer === 'dBZ' || activeLayer === 'combined') {
        stormCells.forEach((cell) => {
          // Adjust cell position based on timeOffsetMinutes (past or future projection)
          const timeDriftHours = timeOffsetMinutes / 60;
          const radHeading = (cell.headingDeg * Math.PI) / 180;
          const driftDistPx = ((cell.speedKmH * timeDriftHours) / 250) * maxRadius;

          // Lat/lon delta to pixels (approx 1 deg lat = 111 km)
          const deltaLat = cell.lat - location.lat;
          const deltaLon = cell.lon - location.lon;
          const cellPxDist = (Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon) * 111 / 250) * maxRadius;
          const cellAngle = Math.atan2(deltaLat, deltaLon);

          const cellX = centerX + Math.cos(cellAngle) * cellPxDist + Math.cos(radHeading) * driftDistPx;
          const cellY = centerY - Math.sin(cellAngle) * cellPxDist - Math.sin(radHeading) * driftDistPx;

          const cellRadius = Math.max(25, (cell.intensityDbz / 65) * 65 * zoomLevel);

          // Doppler Color Gradients according to dBZ
          const grad = ctx.createRadialGradient(cellX, cellY, 2, cellX, cellY, cellRadius);

          if (cell.intensityDbz >= 55) {
            // Extreme / Hail / Tornado (Purple - Crimson - Amber)
            grad.addColorStop(0, 'rgba(236, 72, 153, 0.85)'); // Pink/Purple core
            grad.addColorStop(0.3, 'rgba(239, 68, 68, 0.75)'); // Red
            grad.addColorStop(0.6, 'rgba(245, 158, 11, 0.6)'); // Amber
            grad.addColorStop(0.85, 'rgba(34, 197, 94, 0.35)'); // Green
            grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
          } else if (cell.intensityDbz >= 40) {
            // Heavy Rain / Thunderstorm (Red - Orange - Green)
            grad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
            grad.addColorStop(0.35, 'rgba(245, 158, 11, 0.65)');
            grad.addColorStop(0.7, 'rgba(34, 197, 94, 0.4)');
            grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
          } else {
            // Moderate / Light Rain (Yellow - Green - Cyan)
            grad.addColorStop(0, 'rgba(234, 179, 8, 0.7)');
            grad.addColorStop(0.4, 'rgba(34, 197, 94, 0.45)');
            grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.25)');
            grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          }

          ctx.beginPath();
          ctx.arc(cellX, cellY, cellRadius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Storm Cell Vector Arrow (Movement Heading)
          ctx.beginPath();
          const arrowLen = 30 * zoomLevel;
          const endArrowX = cellX + Math.cos(radHeading) * arrowLen;
          const endArrowY = cellY - Math.sin(radHeading) * arrowLen;

          ctx.moveTo(cellX, cellY);
          ctx.lineTo(endArrowX, endArrowY);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Cell Badge Label
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`${cell.intensityDbz} dBZ · ${cell.speedKmH} กม./ชม.`, cellX + 12, cellY - 10);
        });
      }

      // Render Wind Flow Streamlines (vector streamlines)
      if (activeLayer === 'wind' || activeLayer === 'combined') {
        const windAngle = ((currentWeather.windDirection - 90) * Math.PI) / 180;
        const lineCount = 18;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.2;

        for (let i = 0; i < lineCount; i++) {
          const streamRadius = (maxRadius * (i + 1)) / (lineCount + 1);
          const offsetAngle = (particleOffset * 0.005 + (i * Math.PI) / 6) % (Math.PI * 2);
          const px = centerX + Math.cos(offsetAngle) * streamRadius;
          const py = centerY + Math.sin(offsetAngle) * streamRadius;

          const vx = Math.cos(windAngle) * 22;
          const vy = Math.sin(windAngle) * 22;

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + vx, py + vy);
          ctx.stroke();

          // Tiny arrow tip
          ctx.beginPath();
          ctx.arc(px + vx, py + vy, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
          ctx.fill();
        }
      }

      // Radar Sweep Scan Line & Phosphorus Trail
      ctx.save();
      const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      sweepGradient.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      sweepGradient.addColorStop(1, 'rgba(56, 189, 248, 0.05)');

      // Draw faint trailing sector (Phosphor persistence)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, sweepAngle - 0.4, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fill();

      // Sharp beam line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(sweepAngle) * maxRadius, centerY + Math.sin(sweepAngle) * maxRadius);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Station Center Crosshair (User/Location Target)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444'; // Red center pin
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(location.nameTh, centerX, centerY + 18);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [location, currentWeather, stormCells, activeLayer, zoomLevel, timeOffsetMinutes]);

  // Timeline auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeOffsetMinutes((prev) => {
        if (prev >= 60) return -120; // loop back to 2 hours ago
        return prev + 15;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Mouse hover telemetry tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const dx = x - centerX;
    const dy = y - centerY;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = (Math.min(canvas.width, canvas.height) / 2 - 25) * zoomLevel;
    const distKm = Math.round((distPx / maxRadius) * 250);

    // Approximate dBZ based on distance to nearest storm cell
    let maxDbz = 12;
    stormCells.forEach((c) => {
      const deltaLat = c.lat - location.lat;
      const deltaLon = c.lon - location.lon;
      const cellDist = (Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon) * 111 / 250) * maxRadius;
      const cellAngle = Math.atan2(deltaLat, deltaLon);
      const cellX = centerX + Math.cos(cellAngle) * cellDist;
      const cellY = centerY - Math.sin(cellAngle) * cellDist;

      const pDist = Math.sqrt((x - cellX) ** 2 + (y - cellY) ** 2);
      if (pDist < 50) {
        const decay = Math.max(0, 1 - pDist / 50);
        maxDbz = Math.max(maxDbz, Math.round(c.intensityDbz * decay));
      }
    });

    const mmh = maxDbz > 20 ? Math.round(Math.pow(10, (maxDbz - 16) / 16) * 10) / 10 : 0;
    setHoverData({ x, y, dbz: maxDbz, mmh, distKm });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  const formatOffsetLabel = (offset: number) => {
    if (offset === 0) return 'เรียลไทม์ (ปัจจุบัน)';
    if (offset < 0) return `${Math.abs(offset)} นาทีที่แล้ว (ย้อนหลัง)`;
    return `+${offset} นาที (คาดการณ์ Nowcast)`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Radar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-slate-100">
            เรดาร์ตรวจอากาศด็อปเปลอร์ (Doppler Weather Radar)
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">
            รัศมีการตรวจวัด 250 กม. · สถานี {location.nameTh}
          </span>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveLayer('combined')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeLayer === 'combined' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ภาพรวม
          </button>
          <button
            onClick={() => setActiveLayer('dBZ')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeLayer === 'dBZ' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            การสะท้อนฝน (dBZ)
          </button>
          <button
            onClick={() => setActiveLayer('wind')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeLayer === 'wind' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            กระแสลม (Wind)
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[520px] bg-slate-950 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {/* Floating Zoom & Controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.2))}
            title="ขยายมุมมอง"
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg shadow-md transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
            title="ย่อมุมมอง"
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg shadow-md transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            title="รีเซ็ตการซูม"
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg shadow-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Hover telemetry tooltip */}
        {hoverData && (
          <div
            className="pointer-events-none absolute z-20 px-3 py-2 bg-slate-900/95 border border-cyan-500/40 rounded-lg text-xs shadow-xl text-slate-200 backdrop-blur-sm"
            style={{
              left: Math.min(hoverData.x + 12, 600),
              top: Math.max(hoverData.y - 45, 15),
            }}
          >
            <div className="font-semibold text-cyan-400 mb-0.5">พิกัดตรวจวัดเรดาร์</div>
            <div className="flex items-center gap-2 font-mono tabular-nums text-slate-300">
              <span>ความแรง: <strong className="text-white">{hoverData.dbz} dBZ</strong></span>
              <span>·</span>
              <span>ฝน: <strong className="text-white">{hoverData.mmh} มม./ชม.</strong></span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              ระยะห่างจากสถานี: {hoverData.distKm} กม.
            </div>
          </div>
        )}

        {/* Live Status Indicator */}
        <div className="absolute left-4 top-4 flex items-center gap-2 px-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded-md backdrop-blur-sm text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium font-mono-numbers">
            {formatOffsetLabel(timeOffsetMinutes)}
          </span>
        </div>
      </div>

      {/* Doppler Timeline Playback Scrubber & Legend */}
      <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Play/Pause & Slider */}
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-1.5 text-xs shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'หยุดชั่วคราว' : 'เล่นภาพเรดาร์'}</span>
            </button>

            <div className="flex items-center gap-2 flex-1">
              <span className="text-[11px] text-slate-400 shrink-0 font-mono">-120m</span>
              <input
                type="range"
                min={-120}
                max={60}
                step={15}
                value={timeOffsetMinutes}
                onChange={(e) => {
                  setIsPlaying(false);
                  setTimeOffsetMinutes(Number(e.target.value));
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[11px] text-slate-400 shrink-0 font-mono">+60m</span>
            </div>
          </div>

          {/* Current Wind & Speed Info */}
          <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>ลม: <strong className="text-slate-200 font-mono tabular-nums">{currentWeather.windSpeed}</strong> กม./ชม.</span>
            </div>
            <div className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>ทิศทาง: <strong className="text-slate-200 font-mono tabular-nums">{currentWeather.windDirection}°</strong></span>
            </div>
          </div>
        </div>

        {/* Color Intensity Scale (dBZ Legend) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
          <span className="font-medium text-slate-300">แถบความแรงสะท้อน (dBZ):</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-cyan-400"></span>
              <span>15 (ละออง)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
              <span>30 (ปานกลาง)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
              <span>45 (ฝนหนัก)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-rose-600"></span>
              <span>55 (พายุรุนแรง)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-purple-500"></span>
              <span>65+ (ลูกเห็บ/ลมหมุน)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
