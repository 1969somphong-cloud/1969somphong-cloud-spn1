import React from 'react';
import { 
  Sparkles, 
  RotateCw, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Users, 
  Package, 
  AlertTriangle 
} from 'lucide-react';
import { AIAnalysisResult } from '../types/weather';

interface AIWeatherAdvisorProps {
  analysis: AIAnalysisResult | null;
  isLoading: boolean;
  onRefresh: () => void;
  locationName: string;
}

export const AIWeatherAdvisor: React.FC<AIWeatherAdvisorProps> = ({
  analysis,
  isLoading,
  onRefresh,
  locationName,
}) => {
  if (isLoading && !analysis) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-3">
        <div className="inline-flex p-3 bg-cyan-950/60 rounded-full text-cyan-400 animate-spin">
          <RotateCw className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-100">
          AI กำลังประมวลผลข้อมูลอุตุนิยมวิทยาขั้นสูง...
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          วิเคราะห์ความกดอากาศ อัตราการสะสมของน้ำฝน ทิศทางลมกระโชก และสถิติดาวเทียมสำหรับ {locationName}
        </p>
      </div>
    );
  }

  if (!analysis) return null;

  const isCritical = analysis.alertLevel === 'CRITICAL_EMERGENCY';
  const isWarning = analysis.alertLevel === 'WARNING';
  const isWatch = analysis.alertLevel === 'WATCH';

  const badgeColor = isCritical
    ? 'bg-rose-600 text-white'
    : isWarning
    ? 'bg-amber-500 text-slate-950'
    : isWatch
    ? 'bg-yellow-500 text-slate-950'
    : 'bg-emerald-600 text-white';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-950/80 border border-cyan-800/60 rounded-lg text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                ระบบประเมินความเสี่ยงและพยากรณ์อัจฉริยะ (AI Risk Assessment)
              </h2>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                {analysis.alertLevelTh}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              วิเคราะห์สังเคราะห์โดย Gemini AI อ้างอิงตามเกณฑ์กรมอุตุนิยมวิทยาและมาตรฐาน ปภ.
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ใหม่'}</span>
        </button>
      </div>

      {/* Headline & Summary */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
        <h3 className="text-base font-bold text-cyan-300">
          {analysis.headline}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {analysis.situationSummary}
        </p>

        {analysis.timelineForecast && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-900 text-xs text-amber-300">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>ช่วงเวลาวิกฤต: <strong>{analysis.timelineForecast}</strong></span>
          </div>
        )}
      </div>

      {/* Risk Factors Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          ดัชนีชี้วัดความเสี่ยงเฉพาะด้าน (Risk Probability Matrix)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {analysis.riskFactors.map((factor, idx) => {
            const barColor = factor.severity === 'SEVERE'
              ? 'bg-rose-500'
              : factor.severity === 'HIGH'
              ? 'bg-amber-500'
              : factor.severity === 'MODERATE'
              ? 'bg-yellow-400'
              : 'bg-emerald-400';

            return (
              <div key={idx} className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{factor.type}</span>
                  <span className="font-mono tabular-nums font-bold text-slate-300">{factor.riskPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${barColor}`}
                    style={{ width: `${factor.riskPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {factor.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Advice & Vulnerable Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
        {/* Actionable Checklist */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>ข้อควรปฏิบัติด่วนสำหรับประชาชน:</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {analysis.actionableAdvice.map((adv, i) => (
              <li key={i} className="flex items-start gap-2 bg-slate-950/30 p-2 rounded border border-slate-800/60">
                <span className="text-cyan-400 font-bold">·</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Vulnerable Groups & Evacuation */}
        <div className="space-y-3">
          {analysis.vulnerableGroupsAdvice && (
            <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-800/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Users className="w-4 h-4" />
                <span>คำแนะนำสำหรับกลุ่มเปราะบาง:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.vulnerableGroupsAdvice}
              </p>
            </div>
          )}

          {analysis.evacuationPreparedness && (
            <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-800/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                <Package className="w-4 h-4" />
                <span>การเตรียมความพร้อม / สัมภาระฉุกเฉิน:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.evacuationPreparedness}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
