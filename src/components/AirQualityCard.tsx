import React from 'react';
import { Wind, ShieldAlert, Heart, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AirQualityData } from '../types/weather';

interface AirQualityCardProps {
  airQuality: AirQualityData;
  locationName: string;
}

export const AirQualityCard: React.FC<AirQualityCardProps> = ({
  airQuality,
  locationName,
}) => {
  const isHighPM = airQuality.pm25 >= 37.5;
  const isHazardous = airQuality.pm25 >= 75.0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-slate-100">
            ดัชนีคุณภาพอากาศและฝุ่นละออง PM2.5 (Air Quality Monitor)
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          สถานีตรวจวัด {locationName}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Main PM2.5 Figure */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center space-y-2">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            ความเข้มข้น PM2.5
          </div>
          <div className="text-5xl font-extrabold text-white font-mono-numbers">
            {airQuality.pm25}
          </div>
          <div className="text-xs text-slate-400">ไมโครกรัมต่อลูกบาศก์เมตร (µg/m³)</div>
          <div className={`text-xs font-bold pt-1 ${airQuality.color}`}>
            {airQuality.levelTh}
          </div>
        </div>

        {/* AQI Score & PM10 */}
        <div className="space-y-4">
          <div className="bg-slate-950/40 border border-slate-800 p-3.5 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">ดัชนีคุณภาพอากาศ (US AQI)</div>
              <div className="text-2xl font-bold text-white font-mono-numbers">{airQuality.aqi}</div>
            </div>
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>

          <div className="bg-slate-950/40 border border-slate-800 p-3.5 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">ฝุ่นละอองขนาดใหญ่ PM10</div>
              <div className="text-2xl font-bold text-white font-mono-numbers">{airQuality.pm10} <span className="text-xs text-slate-400 font-normal">µg/m³</span></div>
            </div>
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* Health Protection Guidelines */}
        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>คำแนะนำการดูแลสุขภาพและป้องกัน:</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">·</span>
              <span>
                {isHazardous
                  ? 'งดกิจกรรมกลางแจ้งทุกชนิด ควรสวมหน้ากาก N95 ตลอดเวลา'
                  : isHighPM
                  ? 'สวมหน้ากากป้องกันฝุ่นเมื่อออกนอกอาคาร ลดเวลาออกกำลังกายกลางแจ้ง'
                  : 'คุณภาพอากาศปกติ สามารถทำกิจกรรมกลางแจ้งได้ตามปกติ'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">·</span>
              <span>
                {isHighPM
                  ? 'ปิดประตูหน้าต่าง เปิดเครื่องฟอกอากาศที่มีแผ่นกรอง HEPA'
                  : 'เปิดระบายอากาศภายในที่พักอาศัยได้ตามปกติ'}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Atmospheric Gas breakdown */}
      {(airQuality.no2 || airQuality.o3 || airQuality.so2) && (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-center text-xs">
          <div className="p-2 bg-slate-950/30 rounded border border-slate-800/60">
            <div className="text-slate-400 text-[11px]">ไนโตรเจนไดออกไซด์ (NO₂)</div>
            <div className="font-mono tabular-nums text-white font-semibold mt-0.5">{airQuality.no2 ? `${airQuality.no2} µg/m³` : '-'}</div>
          </div>
          <div className="p-2 bg-slate-950/30 rounded border border-slate-800/60">
            <div className="text-slate-400 text-[11px]">โอโซนระดับผิวดิน (O₃)</div>
            <div className="font-mono tabular-nums text-white font-semibold mt-0.5">{airQuality.o3 ? `${airQuality.o3} µg/m³` : '-'}</div>
          </div>
          <div className="p-2 bg-slate-950/30 rounded border border-slate-800/60">
            <div className="text-slate-400 text-[11px]">ซัลเฟอร์ไดออกไซด์ (SO₂)</div>
            <div className="font-mono tabular-nums text-white font-semibold mt-0.5">{airQuality.so2 ? `${airQuality.so2} µg/m³` : '-'}</div>
          </div>
        </div>
      )}
    </div>
  );
};
