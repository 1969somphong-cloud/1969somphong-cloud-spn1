import React from 'react';
import { Bell, Volume2, VolumeX, ShieldAlert, Sparkles } from 'lucide-react';

interface TopNavigationProps {
  activeTab: 'overview' | 'radar' | 'forecast' | 'airquality' | 'alerts';
  onSelectTab: (tab: 'overview' | 'radar' | 'forecast' | 'airquality' | 'alerts') => void;
  hasCriticalAlert: boolean;
  onOpenSimulation: () => void;
  onOpenHotlines: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  onSelectTab,
  hasCriticalAlert,
  onOpenSimulation,
  onOpenHotlines,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Zone 1: Single text element wordmark */}
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); onSelectTab('overview'); }}
          className="text-xl font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          VAYU Alert
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('overview')}
            className={`transition-colors hover:text-white whitespace-nowrap ${
              activeTab === 'overview' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 py-1' : ''
            }`}
          >
            ภาพรวม
          </button>
          <button
            onClick={() => onSelectTab('radar')}
            className={`transition-colors hover:text-white whitespace-nowrap ${
              activeTab === 'radar' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 py-1' : ''
            }`}
          >
            เรดาร์ด็อปเปลอร์
          </button>
          <button
            onClick={() => onSelectTab('alerts')}
            className={`transition-colors hover:text-white flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'alerts' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 py-1' : ''
            }`}
          >
            เตือนภัยฉุกเฉิน
            {hasCriticalAlert && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('forecast')}
            className={`transition-colors hover:text-white whitespace-nowrap ${
              activeTab === 'forecast' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 py-1' : ''
            }`}
          >
            พยากรณ์ 7 วัน
          </button>
          <button
            onClick={() => onSelectTab('airquality')}
            className={`transition-colors hover:text-white whitespace-nowrap ${
              activeTab === 'airquality' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 py-1' : ''
            }`}
          >
            คุณภาพอากาศ PM2.5
          </button>
          <button
            onClick={onOpenHotlines}
            className="transition-colors hover:text-rose-400 whitespace-nowrap text-slate-400 hover:underline"
          >
            สายด่วน ปภ. 1784
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Sound Mute/Unmute Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'ปิดเสียงสัญญาณไซเรนเตือนภัย' : 'เปิดเสียงสัญญาณไซเรนเตือนภัย'}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-slate-800 text-cyan-400 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Disaster Simulation Trigger */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">จำลองสถานการณ์พายุ</span>
            <span className="sm:hidden">ซ้อมเตือนภัย</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-2 bg-slate-950 text-xs">
        <button
          onClick={() => onSelectTab('overview')}
          className={`px-2 py-1 rounded ${activeTab === 'overview' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          ภาพรวม
        </button>
        <button
          onClick={() => onSelectTab('radar')}
          className={`px-2 py-1 rounded ${activeTab === 'radar' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          เรดาร์
        </button>
        <button
          onClick={() => onSelectTab('alerts')}
          className={`px-2 py-1 rounded flex items-center gap-1 ${activeTab === 'alerts' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          เตือนภัย
          {hasCriticalAlert && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
        </button>
        <button
          onClick={() => onSelectTab('forecast')}
          className={`px-2 py-1 rounded ${activeTab === 'forecast' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          พยากรณ์
        </button>
        <button
          onClick={() => onSelectTab('airquality')}
          className={`px-2 py-1 rounded ${activeTab === 'airquality' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          PM2.5
        </button>
      </div>
    </header>
  );
};
