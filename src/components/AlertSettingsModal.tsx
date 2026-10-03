import React, { useState } from 'react';
import { X, Sliders, Volume2, Save, RotateCcw } from 'lucide-react';
import { AlertThresholds } from '../types/weather';
import { DEFAULT_THRESHOLDS } from '../services/weatherApi';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: AlertThresholds;
  onSaveThresholds: (t: AlertThresholds) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onSaveThresholds,
  soundEnabled,
  onToggleSound,
}) => {
  const [localThresholds, setLocalThresholds] = useState<AlertThresholds>(thresholds);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveThresholds(localThresholds);
    onClose();
  };

  const handleReset = () => {
    setLocalThresholds(DEFAULT_THRESHOLDS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950/80 border border-cyan-800/60 rounded-lg text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                ตั้งค่าเกณฑ์ตรวจจับและแจ้งเตือนภัย (Alert Thresholds)
              </h2>
              <p className="text-xs text-slate-400">
                กำหนดค่าพารามิเตอร์ทางสภาพอากาศที่ต้องการให้ระบบส่งสัญญาณเตือน
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders Form */}
        <div className="p-6 space-y-5">
          {/* Rain Threshold */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                อัตราฝนตกหนักเพื่อเริ่มเตือนภัยน้ำท่วม:
              </span>
              <span className="font-mono tabular-nums font-bold text-cyan-400">
                {localThresholds.rainRateMmPerHour} มม./ชม.
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={localThresholds.rainRateMmPerHour}
              onChange={(e) => setLocalThresholds({ ...localThresholds, rainRateMmPerHour: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>10 มม. (ปานกลาง)</span>
              <span>35 มม. (หนักมาก)</span>
              <span>60 มม. (วิกฤต)</span>
            </div>
          </div>

          {/* Wind Gust Threshold */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                ความเร็วลมกระโชกเพื่อเตือนภัยพายุ:
              </span>
              <span className="font-mono tabular-nums font-bold text-amber-400">
                {localThresholds.windGustKmH} กม./ชม.
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={90}
              step={5}
              value={localThresholds.windGustKmH}
              onChange={(e) => setLocalThresholds({ ...localThresholds, windGustKmH: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>30 กม./ชม.</span>
              <span>60 กม./ชม. (พายุฤดูร้อน)</span>
              <span>90 กม./ชม. (ไต้ฝุ่น)</span>
            </div>
          </div>

          {/* PM2.5 Threshold */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                เกณฑ์แจ้งเตือนฝุ่นละออง PM2.5:
              </span>
              <span className="font-mono tabular-nums font-bold text-rose-400">
                {localThresholds.pm25Threshold} µg/m³
              </span>
            </div>
            <input
              type="range"
              min={25}
              max={100}
              step={2.5}
              value={localThresholds.pm25Threshold}
              onChange={(e) => setLocalThresholds({ ...localThresholds, pm25Threshold: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>25 µg/m³</span>
              <span>37.5 µg/m³ (มาตรฐาน ปภ.)</span>
              <span>75 µg/m³ (อันตรายสีแดง)</span>
            </div>
          </div>

          {/* Heat Index Threshold */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                เกณฑ์ดัชนีความร้อน (Heat Index) เสี่ยงฮีทสโตรก:
              </span>
              <span className="font-mono tabular-nums font-bold text-purple-400">
                {localThresholds.heatIndexThreshold}°C
              </span>
            </div>
            <input
              type="range"
              min={35}
              max={54}
              step={1}
              value={localThresholds.heatIndexThreshold}
              onChange={(e) => setLocalThresholds({ ...localThresholds, heatIndexThreshold: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>35°C</span>
              <span>41°C (เสี่ยงลมแดด)</span>
              <span>54°C (อันตรายสูงสุด)</span>
            </div>
          </div>

          {/* Sound Notification Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xs font-semibold text-white">เสียงไซเรนเตือนภัยฉุกเฉิน (EAS Tone)</div>
                <div className="text-[11px] text-slate-400">ส่งเสียงความถี่ 853Hz+960Hz เมื่อเกิดเหตุภัยพิบัติระดับวิกฤต</div>
              </div>
            </div>

            <button
              onClick={onToggleSound}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                soundEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่ามาตรฐาน</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
