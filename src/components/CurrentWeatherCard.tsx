import React from 'react';
import { 
  Wind, 
  Droplets, 
  Gauge, 
  Sun, 
  CloudRain, 
  CloudLightning, 
  Eye, 
  Thermometer, 
  MapPin, 
  Navigation, 
  Compass,
  AlertCircle
} from 'lucide-react';
import { CurrentWeather, LocationItem } from '../types/weather';
import { getWeatherDescription, calculateHeatIndex } from '../services/weatherApi';

interface CurrentWeatherCardProps {
  location: LocationItem;
  weather: CurrentWeather;
  onSelectLocation: (loc: LocationItem) => void;
  onDetectLocation: () => void;
  isDetectingLocation: boolean;
  allLocations: LocationItem[];
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  location,
  weather,
  onSelectLocation,
  onDetectLocation,
  isDetectingLocation,
  allLocations,
}) => {
  const desc = getWeatherDescription(weather.weatherCode);
  const heatIndex = calculateHeatIndex(weather.temp, weather.humidity);

  // Heat Index Risk Label
  const getHeatIndexBadge = (hi: number) => {
    if (hi >= 54) return { label: 'อันตรายสูงสุด (Extreme Danger)', color: 'text-purple-400' };
    if (hi >= 41) return { label: 'อันตราย (Danger - เสี่ยงลมแดด)', color: 'text-rose-400' };
    if (hi >= 32) return { label: 'เตือนภัย (Extreme Caution)', color: 'text-amber-400' };
    return { label: 'ปกติ (Caution)', color: 'text-emerald-400' };
  };

  const hiRisk = getHeatIndexBadge(heatIndex);

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Satellite Imagery Scrim Backdrop */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <img
          src="/src/assets/images/meteorology_storm_radar_1790994711978.jpg"
          alt="Satellite radar backdrop"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-900/60" />
      </div>

      <div className="relative z-10 p-5 sm:p-6 space-y-6">
        {/* Top Header: Location Selector & Coordinates */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {location.nameTh}
                </h1>
                <span className="text-xs text-slate-400 hidden sm:inline">({location.name}, {location.country})</span>
              </div>
              <div className="text-xs text-slate-400 font-mono-numbers">
                พิกัด: {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E · ตรวจวัดล่าสุด {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
              </div>
            </div>
          </div>

          {/* Location Select and GPS Auto-detect */}
          <div className="flex items-center gap-2">
            <select
              value={location.id}
              onChange={(e) => {
                const target = allLocations.find((l) => l.id === e.target.value);
                if (target) onSelectLocation(target);
              }}
              className="px-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              {allLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nameTh}
                </option>
              ))}
            </select>

            <button
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              title="ตรวจจับตำแหน่งพิกัด GPS อัตโนมัติ"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Hero Temperature & Condition Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
          {/* Main Temperature */}
          <div className="flex items-baseline gap-3">
            <div className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-white font-mono-numbers">
              {weather.temp}°
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-medium text-slate-400">เซลเซียส</div>
              <div className="text-xs text-slate-300 font-mono-numbers">
                รู้สึกเหมือน <strong className="text-white">{weather.apparentTemp}°C</strong>
              </div>
            </div>
          </div>

          {/* Condition Description & Severity */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {desc.severity === 'danger' ? (
                <CloudLightning className="w-6 h-6 text-rose-400 animate-pulse" />
              ) : desc.severity === 'caution' ? (
                <CloudRain className="w-6 h-6 text-amber-400" />
              ) : (
                <Sun className="w-6 h-6 text-yellow-400" />
              )}
              <div className="text-lg font-bold text-slate-100">
                {desc.text}
              </div>
            </div>
            <div className="text-xs text-slate-400">
              ความหนาแน่นเมฆ: <span className="text-slate-200 font-mono-numbers">{weather.cloudCover}%</span> · รหัส WMO: <span className="font-mono">{weather.weatherCode}</span>
            </div>
          </div>

          {/* Heat Index Gauge */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">ดัชนีความร้อน (Heat Index)</span>
              <strong className="text-white font-mono-numbers text-sm">{heatIndex}°C</strong>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  heatIndex >= 54 ? 'bg-purple-500' : heatIndex >= 41 ? 'bg-rose-500' : heatIndex >= 32 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(10, ((heatIndex - 20) / 35) * 100))}%` }}
              />
            </div>
            <div className={`text-[11px] font-medium ${hiRisk.color}`}>
              {hiRisk.label}
            </div>
          </div>
        </div>

        {/* 6-Grid Atmospheric Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-800/80">
          {/* Wind & Gusts */}
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>ความเร็วลม</span>
            </div>
            <div className="text-base font-bold text-white font-mono-numbers">
              {weather.windSpeed} <span className="text-xs font-normal text-slate-400">กม./ชม.</span>
            </div>
            <div className="text-[11px] text-amber-400 font-mono-numbers mt-0.5">
              ลมกระโชก {weather.windGusts} กม./ชม.
            </div>
          </div>

          {/* Rainfall Rate */}
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span>ปริมาณฝน</span>
            </div>
            <div className="text-base font-bold text-white font-mono-numbers">
              {weather.precipitation} <span className="text-xs font-normal text-slate-400">มม./ชม.</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {weather.precipitation > 0 ? 'กำลังมีฝนตก' : 'ไม่มีฝนตก ณ ขณะนี้'}
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Droplets className="w-3.5 h-3.5 text-indigo-400" />
              <span>ความชื้นสัมพัทธ์</span>
            </div>
            <div className="text-base font-bold text-white font-mono-numbers">
              {weather.humidity} <span className="text-xs font-normal text-slate-400">%</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono-numbers mt-0.5">
              จุดน้ำค้าง {weather.dewPoint}°C
            </div>
          </div>

          {/* Atmospheric Pressure */}
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Gauge className="w-3.5 h-3.5 text-purple-400" />
              <span>ความกดอากาศ</span>
            </div>
            <div className="text-base font-bold text-white font-mono-numbers">
              {weather.pressure} <span className="text-xs font-normal text-slate-400">hPa</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {weather.pressure < 1000 ? 'หย่อมความกดอากาศต่ำ' : 'ความกดอากาศปานกลาง'}
            </div>
          </div>

          {/* UV Index */}
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>ดัชนี UV</span>
            </div>
            <div className="text-base font-bold text-white font-mono-numbers">
              {weather.uvIndex} <span className="text-xs font-normal text-slate-400">/12</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {weather.uvIndex >= 8 ? 'อันตรายสูงมาก' : weather.uvIndex >= 6 ? 'ระดับสูง' : 'ระดับต่ำถึงปานกลาง'}
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>ทัศนวิสัย</span>
            </div>
            <div className="text-base font-bold text-white font-mono-numbers">
              {weather.visibility} <span className="text-xs font-normal text-slate-400">กม.</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {weather.visibility >= 10 ? 'ทัศนวิสัยดีมาก' : 'มีหมอก/ฝนบดบัง'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
