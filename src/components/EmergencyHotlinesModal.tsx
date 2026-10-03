import React from 'react';
import { PhoneCall, X, ShieldAlert, CheckSquare, ExternalLink, LifeBuoy } from 'lucide-react';

interface EmergencyHotlinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HOTLINES = [
  {
    number: '1784',
    name: 'กรมป้องกันและบรรเทาสาธารณภัย (ปภ.)',
    desc: 'ศูนย์เตือนภัยพิบัติแห่งชาติ รับแจ้งเหตุด่วนภัยธรรมชาติ 24 ชม.',
    badge: 'สายด่วนหลัก',
    color: 'border-rose-500/50 text-rose-300'
  },
  {
    number: '1182',
    name: 'กรมอุตุนิยมวิทยา',
    desc: 'ศูนย์บริการพยากรณ์อากาศและสอบถามสภาพอากาศรุนแรง',
    badge: 'สภาพอากาศ',
    color: 'border-cyan-500/50 text-cyan-300'
  },
  {
    number: '1669',
    name: 'สถาบันการแพทย์ฉุกเฉินแห่งชาติ (สพฉ.)',
    desc: 'หน่วยแพทย์กู้ชีพฉุกเฉิน เจ็บป่วยฉุกเฉิน หรือบาดเจ็บจากอุบัติภัย',
    badge: 'กู้ชีพ 24 ชม.',
    color: 'border-emerald-500/50 text-emerald-300'
  },
  {
    number: '1193',
    name: 'ตำรวจทางหลวง',
    desc: 'ตรวจสอบเส้นทางจราจร น้ำท่วมขัง ถนนตัดขาด หรือดินถล่ม',
    badge: 'จราจร/ทางหลวง',
    color: 'border-amber-500/50 text-amber-300'
  },
  {
    number: '199',
    name: 'ศูนย์ดับเพลิงและกู้ภัย (พระราม)',
    desc: 'ช่วยเหลือผู้ประสบภัย อพยพ จับสัตว์เลื้อยคลานที่มากับน้ำ',
    badge: 'ดับเพลิง/กู้ภัย',
    color: 'border-indigo-500/50 text-indigo-300'
  },
  {
    number: '1146',
    name: 'กรมทางหลวงชนบท',
    desc: 'แจ้งเหตุถนนและสะพานในชนบทชำรุดจากอุทกภัย',
    badge: 'ถนนชนบท',
    color: 'border-slate-700 text-slate-300'
  }
];

export const EmergencyHotlinesModal: React.FC<EmergencyHotlinesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-950/70 border border-rose-800/60 rounded-lg text-rose-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                สายด่วนแจ้งเหตุฉุกเฉินและหน่วยกู้ชีพ (Emergency Hotlines)
              </h2>
              <p className="text-xs text-slate-400">
                เบอร์โทรศัพท์ติดต่อช่วยเหลือกรณีเกิดภัยพิบัติทางธรรมชาติ 24 ชั่วโมง
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Hotlines Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HOTLINES.map((h, i) => (
              <a
                key={i}
                href={`tel:${h.number}`}
                className="group p-4 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xl font-black font-mono tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                      {h.number}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${h.color}`}>
                      {h.badge}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-200">
                    {h.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    {h.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-cyan-400 font-medium">
                  <span>กดโทรออกทันที</span>
                  <PhoneCall className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>

          {/* 72-Hour Emergency Kit Checklist */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              <span>รายการสัมภาระฉุกเฉิน 72 ชั่วโมง (Emergency Go-Bag Checklist):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>น้ำดื่มสะอาดอย่างน้อย 3 ลิตร/คน/วัน</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>อาหารแห้ง อาหารกระป๋อง และที่เปิด</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>ไฟฉาย ถ่านสำรอง และแบตเตอรี่สำรอง</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>ชุดปฐมพยาบาลและยารักษาโรคประจำตัว</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>นกหวีดขอความช่วยเหลือและเสื้อชูชีพ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>ถุงกันน้ำบรรจุเอกสารสำคัญ (บัตร ปชช./โฉนด)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>ในกรณีเหตุฉุกเฉินร้ายแรง ให้ติดต่อ 1784 หรือ 1669 ทันที</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
