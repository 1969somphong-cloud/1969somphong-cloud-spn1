import React from 'react';
import { Clock, CloudRain, Wind, Droplets } from 'lucide-react';
import { HourlyForecastItem } from '../types/weather';
import { getWeatherDescription } from '../services/weatherApi';

interface HourlyNowcastProps {
  hourly: HourlyForecastItem[];
}

export const HourlyNowcast: React.FC<HourlyNowcastProps> = ({ hourly }) => {
  if (!hourly || hourly.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-slate-100">
            พยากรณ์อากาศความละเอียดสูงรายชั่วโมง (24-Hour Nowcast)
          </h2>
        </div>
        <span className="text-xs text-slate-400">เลื่อนแนวนอนเพื่อดูเวลาถัดไป</span>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {hourly.map((item, idx) => {
          const desc = getWeatherDescription(item.weatherCode);
          const isHeavyRain = item.precipitation >= 10 || item.precipitationProbability >= 70;
          const isHighWind = item.windGust >= 45;

          return (
            <div
              key={idx}
              className={`flex flex-col items-center justify-between p-3 rounded-xl border min-w-[108px] shrink-0 transition-all ${
                isHeavyRain || isHighWind
                  ? 'bg-rose-950/20 border-rose-600/40 hover:border-rose-500'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Hour time */}
              <div className="text-xs font-semibold text-slate-300 font-mono-numbers mb-2">
                {idx === 0 ? 'ตอนนี้' : item.formattedHour}
              </div>

              {/* Rain Probability Badge */}
              <div className="flex items-center gap-1 text-[11px] font-mono-numbers text-cyan-400 mb-2">
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>{item.precipitationProbability}%</span>
              </div>

              {/* Mini Rain Bar */}
              <div className="w-10 bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${item.precipitationProbability > 60 ? 'bg-cyan-400' : 'bg-slate-600'}`}
                  style={{ width: `${item.precipitationProbability}%` }}
                />
              </div>

              {/* Temp */}
              <div className="text-lg font-bold text-white font-mono-numbers my-1">
                {item.temp}°
              </div>

              {/* Condition hint */}
              <div className="text-[10px] text-slate-400 text-center line-clamp-1 mb-2">
                {desc.text}
              </div>

              {/* Wind gust */}
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono-numbers border-t border-slate-900 pt-1.5 w-full justify-center">
                <Wind className="w-3 h-3 text-slate-500" />
                <span>{item.windGust} กม./ชม.</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
