import React from 'react';
import { X, ShieldAlert, Zap, CloudRain, Flame, Wind, RotateCcw, AlertTriangle } from 'lucide-react';

interface DisasterSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSimulation: (type: 'TYPHOON' | 'FLASH_FLOOD' | 'EXTREME_HEAT' | 'PM25_EMERGENCY') => void;
  onResetRealData: () => void;
  isSimulated: boolean;
  currentSimType: string | null;
}

export const DisasterSimulationModal: React.FC<DisasterSimulationModalProps> = ({
  isOpen,
  onClose,
  onSelectSimulation,
  onResetRealData,
  isSimulated,
  currentSimType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-950/70 border border-amber-800/60 rounded-lg text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                ระบบจำลองสถานการณ์ภัยพิบัติ (Disaster Drill Mode)
              </h2>
              <p className="text-xs text-slate-400">
                ทดสอบการทำงานของระบบเตือนภัยฉุกเฉิน สัญญาณไซเรน และการวิเคราะห์ความเสี่ยง
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

        {/* Scenarios */}
        <div className="p-6 space-y-3">
          {/* Scenario 1: Typhoon */}
          <button
            onClick={() => {
              onSelectSimulation('TYPHOON');
              onClose();
            }}
            className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
              currentSimType === 'TYPHOON'
                ? 'bg-rose-950/40 border-rose-500 shadow-md'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-600/30 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  1. พายุไต้ฝุ่น / พายุฤดูร้อนขั้นรุนแรง
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white uppercase">
                  วิกฤตสูงสุด
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                ลมกระโชก 92 กม./ชม. ฝนตกหนักรุนแรง 45 มม./ชม. ลูกเห็บตก และฟ้าผ่าต่อเนื่อง
              </p>
            </div>
          </button>

          {/* Scenario 2: Flash Flood */}
          <button
            onClick={() => {
              onSelectSimulation('FLASH_FLOOD');
              onClose();
            }}
            className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
              currentSimType === 'FLASH_FLOOD'
                ? 'bg-blue-950/40 border-blue-500 shadow-md'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/30 shrink-0">
              <CloudRain className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  2. น้ำท่วมฉับพลันและน้ำป่าไหลหลาก
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white uppercase">
                  เตือนภัยฉุกเฉิน
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                ฝนตกหนักสะสมเกิน 180 มม. อัตราตก 58 มม./ชม. ระดับน้ำลำห้วยวิกฤตล้นตลิ่ง
              </p>
            </div>
          </button>

          {/* Scenario 3: Extreme Heat */}
          <button
            onClick={() => {
              onSelectSimulation('EXTREME_HEAT');
              onClose();
            }}
            className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
              currentSimType === 'EXTREME_HEAT'
                ? 'bg-amber-950/40 border-amber-500 shadow-md'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-600/30 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  3. คลื่นความร้อนสูงจัด (Heatstroke Hazard)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 uppercase font-bold">
                  ระดับอันตราย
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                อุณหภูมิ 42.4°C ดัชนีความร้อนพุ่งแตะ 54.2°C รังสี UV ระดับ 12 เสี่ยงโรคลมแดดเฉียบพลัน
              </p>
            </div>
          </button>

          {/* Scenario 4: Hazardous PM2.5 */}
          <button
            onClick={() => {
              onSelectSimulation('PM25_EMERGENCY');
              onClose();
            }}
            className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
              currentSimType === 'PM25_EMERGENCY'
                ? 'bg-purple-950/40 border-purple-500 shadow-md'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-600/30 shrink-0">
              <Wind className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  4. วิกฤตหมอกควันและมลพิษฝุ่น PM2.5
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white uppercase">
                  อันตรายร้ายแรง
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                ค่าฝุ่น PM2.5 ทะลุ 184 µg/m³ (AQI 235) ทัศนวิสัยลดต่ำ อากาศนิ่งและมีหมอกควันสะสม
              </p>
            </div>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          {isSimulated ? (
            <button
              onClick={() => {
                onResetRealData();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>กลับสู่สภาพอากาศจริง</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400">
              กำลังแสดงข้อมูลสภาพอากาศเรียลไทม์
            </span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
