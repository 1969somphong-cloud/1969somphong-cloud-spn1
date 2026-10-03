import React from 'react';
import { CalendarDays, Droplets, Wind, Sunrise, Sunset, AlertCircle } from 'lucide-react';
import { DailyForecastItem } from '../types/weather';
import { getWeatherDescription } from '../services/weatherApi';

interface DailyForecastViewProps {
  daily: DailyForecastItem[];
}

export const DailyForecastView: React.FC<DailyForecastViewProps> = ({ daily }) => {
  if (!daily || daily.length === 0) return null;

  // Find min and max temp across the 7 days for relative bar width
  const allMins = daily.map((d) => d.tempMin);
  const allMaxs = daily.map((d) => d.tempMax);
  const lowest = Math.min(...allMins);
  const highest = Math.max(...allMaxs);
  const range = Math.max(1, highest - lowest);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-slate-100">
            พยากรณ์อากาศล่วงหน้า 7 วัน (7-Day Trend Outlook)
          </h2>
        </div>
        <span className="text-xs text-slate-400">อัปเดตโมเดลความละเอียดสูง</span>
      </div>

      <div className="space-y-2">
        {daily.map((item, idx) => {
          const desc = getWeatherDescription(item.weatherCode);
          const isSevereDay = item.windGustMax >= 55 || item.precipitationSum >= 35 || [95, 96, 99].includes(item.weatherCode);

          // Calculate left and width percentages for temp range bar
          const leftPct = ((item.tempMin - lowest) / range) * 100;
          const widthPct = Math.max(12, ((item.tempMax - item.tempMin) / range) * 100);

          return (
            <div
              key={idx}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border transition-colors ${
                isSevereDay
                  ? 'bg-rose-950/20 border-rose-600/30 hover:border-rose-500/50'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              {/* Day & Condition */}
              <div className="flex items-center gap-3 min-w-[170px]">
                <span className="w-16 text-sm font-semibold text-white">
                  {item.formattedDay}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-medium">
                    {desc.text}
                  </span>
                  {isSevereDay && (
                    <span title="วันที่มีความเสี่ยงพายุ/ฝนหนักสะสม">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    </span>
                  )}
                </div>
              </div>

              {/* Rain Prob & Amount */}
              <div className="flex items-center gap-4 text-xs font-mono-numbers min-w-[140px]">
                <div className="flex items-center gap-1 text-cyan-400">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{item.precipitationProbabilityMax}%</span>
                </div>
                <div className="text-slate-400">
                  ฝน: <strong className="text-slate-200">{item.precipitationSum}</strong> มม.
                </div>
              </div>

              {/* Temperature Bar */}
              <div className="flex items-center gap-3 flex-1 max-w-xs">
                <span className="text-xs text-slate-400 font-mono-numbers w-7 text-right">
                  {item.tempMin}°
                </span>

                <div className="flex-1 bg-slate-800 h-2 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 to-amber-400"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                  />
                </div>

                <span className="text-xs text-white font-bold font-mono-numbers w-7">
                  {item.tempMax}°
                </span>
              </div>

              {/* Wind & Sun times */}
              <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 font-mono-numbers min-w-[160px] justify-end">
                <div className="flex items-center gap-1" title="ลมกระโชกสูงสุด">
                  <Wind className="w-3 h-3 text-slate-400" />
                  <span>{item.windGustMax} กม./ชม.</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Sunrise className="w-3 h-3 text-amber-500/70" />
                  <span>{item.sunrise}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
