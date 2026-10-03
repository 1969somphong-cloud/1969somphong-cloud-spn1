import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Info,
  PhoneCall
} from 'lucide-react';
import { SevereAlert } from '../types/weather';
import { soundAlert } from '../utils/soundAlert';

interface AlertBannerProps {
  alerts: SevereAlert[];
  onOpenHotlines: () => void;
  soundEnabled: boolean;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alerts,
  onOpenHotlines,
  soundEnabled,
}) => {
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(
    alerts.length > 0 ? alerts[0].id : null
  );
  const [isPlayingSiren, setIsPlayingSiren] = useState<boolean>(false);

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>สถานะสภาพอากาศ: <strong>ปกติในระดับเฝ้าระวังทั่วไป</strong> ไม่พบสัญญาณเตือนภัยสภาพอากาศรุนแรงเฉียบพลันในพื้นที่</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <span>เรดาร์อัปเดตเรียลไทม์</span>
        </div>
      </div>
    );
  }

  const primaryAlert = alerts[0];
  const isEmergency = primaryAlert.severity === 'CRITICAL_EMERGENCY';
  const isWarning = primaryAlert.severity === 'WARNING';

  const handleTestSiren = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingSiren) {
      soundAlert.stop();
      setIsPlayingSiren(false);
    } else {
      setIsPlayingSiren(true);
      if (isEmergency) {
        soundAlert.playEmergencyAlert(4);
      } else {
        soundAlert.playChimeAlert();
      }
      setTimeout(() => setIsPlayingSiren(false), 4000);
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const isCurrentEmergency = alert.severity === 'CRITICAL_EMERGENCY';
        const isCurrentWarning = alert.severity === 'WARNING';
        const isExpanded = expandedAlertId === alert.id;

        const borderBgClass = isCurrentEmergency
          ? 'bg-rose-950/40 border-rose-600/70 text-rose-100'
          : isCurrentWarning
          ? 'bg-amber-950/40 border-amber-500/70 text-amber-100'
          : 'bg-yellow-950/30 border-yellow-500/60 text-yellow-100';

        const badgeBgClass = isCurrentEmergency
          ? 'bg-rose-600 text-white'
          : isCurrentWarning
          ? 'bg-amber-500 text-slate-950'
          : 'bg-yellow-500 text-slate-950';

        return (
          <div
            key={alert.id}
            className={`border rounded-xl p-4 transition-all shadow-lg backdrop-blur-md ${borderBgClass}`}
          >
            <div 
              className="flex items-start justify-between gap-3 cursor-pointer"
              onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${badgeBgClass}`}>
                  <AlertTriangle className={`w-5 h-5 ${isCurrentEmergency ? 'animate-bounce' : ''}`} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase ${badgeBgClass}`}>
                      {alert.severityTh}
                    </span>
                    <span className="text-xs text-slate-300 flex items-center gap-1 font-mono-numbers">
                      <Clock className="w-3 h-3 text-slate-400" />
                      ออกประกาศ: {alert.issuedAt}
                    </span>
                    <span className="text-xs text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      พื้นที่: {alert.affectedArea}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                    {alert.title}
                  </h3>
                  <p className="text-sm font-medium mt-0.5 opacity-90">
                    {alert.headline}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleTestSiren}
                  title="ทดสอบสัญญาณเสียงเตือนภัย"
                  className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors ${
                    isPlayingSiren
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {isPlayingSiren ? 'หยุดเสียงไซเรน' : 'เสียงไซเรน'}
                  </span>
                </button>

                <button
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
                  aria-label="ย่อ/ขยายรายละเอียด"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Expanded Detailed Guidance */}
            {isExpanded && (
              <div className="mt-4 pt-3 border-t border-white/10 space-y-3 text-sm">
                <p className="text-slate-200 leading-relaxed">
                  {alert.description}
                </p>

                {alert.metricsText && (
                  <div className="bg-black/30 px-3 py-2 rounded-lg text-xs font-mono tabular-nums text-cyan-300 border border-white/5">
                    {alert.metricsText}
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    ข้อควรปฏิบัติตามมาตรฐาน ปภ. และกรมอุตุนิยมวิทยา:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {alert.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">·</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                  <span className="text-slate-400">
                    มีผลบังคับใช้ถึง: <strong className="text-slate-200 font-mono-numbers">{alert.expiresAt}</strong>
                  </span>

                  <button
                    onClick={onOpenHotlines}
                    className="flex items-center gap-1.5 text-rose-300 hover:text-white font-medium underline underline-offset-2 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    สายด่วนแจ้งเหตุฉุกเฉินและกู้ชีพ 24 ชม.
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
