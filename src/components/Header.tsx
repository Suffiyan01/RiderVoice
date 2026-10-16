import React from 'react';
import { 
  Radio, 
  Bluetooth, 
  Battery, 
  BatteryCharging, 
  AlertTriangle, 
  Volume2, 
  Sun, 
  Moon, 
  Signal
} from 'lucide-react';
import { HelmetAudioConfig, IntercomChannel } from '../types';

interface HeaderProps {
  helmetConfig: HelmetAudioConfig;
  activeChannel: IntercomChannel;
  isSunlightMode: boolean;
  onToggleSunlightMode: () => void;
  onTriggerSos: () => void;
  onOpenSettings: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  helmetConfig,
  activeChannel,
  isSunlightMode,
  onToggleSunlightMode,
  onTriggerSos,
  onOpenSettings,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-md sticky top-0 z-40 px-3 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Helmet Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg tracking-wider text-white">RIDER</span>
                <span className="font-display font-bold text-lg tracking-wider text-cyan-400">VOICE</span>
                <span className="text-[10px] uppercase font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/80 px-1.5 py-0.5 rounded">v2.4</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute" />
                  <span className="text-[11px] font-mono text-emerald-400 font-medium">MESH ACTIVE</span>
                </span>
                <span className="text-neutral-600">•</span>
                <span className="font-mono text-[11px] truncate max-w-[120px] sm:max-w-none text-neutral-300">
                  {activeChannel.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation tabs for main panels */}
        <nav className="hidden md:flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          {[
            { id: 'cockpit', label: 'Cockpit HUD' },
            { id: 'intercom', label: 'Squad Radio' },
            { id: 'assistant', label: 'Voice AI' },
            { id: 'radar', label: 'Squad Radar' },
            { id: 'memos', label: 'Ride Memos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-neutral-950 shadow-md font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right side Helmet Bluetooth Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bluetooth Device status badge */}
          <button
            onClick={onOpenSettings}
            title="Helmet Audio Settings"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 transition"
          >
            <Bluetooth className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-mono text-xs text-neutral-300 truncate max-w-[100px]">
              {helmetConfig.connectedDevice}
            </span>
            <div className="flex items-center gap-0.5 text-emerald-400 ml-1">
              <Battery className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono font-bold">{helmetConfig.batteryPercentage}%</span>
            </div>
          </button>

          {/* High Contrast / Sunlight mode */}
          <button
            onClick={onToggleSunlightMode}
            title={isSunlightMode ? 'Switch to Night Mode' : 'Sunlight High-Visibility Mode'}
            className={`p-2 rounded-lg border transition ${
              isSunlightMode 
                ? 'bg-amber-400 text-black border-amber-300 font-bold' 
                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            {isSunlightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onTriggerSos}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider border border-rose-400 shadow-lg shadow-rose-950/50 transition active:scale-95 animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-mono">SOS</span>
          </button>
        </div>
      </div>

      {/* Mobile bottom-like quick bar tabs */}
      <div className="flex md:hidden items-center justify-between mt-2 pt-2 border-t border-neutral-800/80 overflow-x-auto gap-1 text-xs">
        {[
          { id: 'cockpit', label: 'Cockpit' },
          { id: 'intercom', label: 'Intercom' },
          { id: 'assistant', label: 'Voice AI' },
          { id: 'radar', label: 'Radar' },
          { id: 'memos', label: 'Memos' },
          { id: 'settings', label: 'Helmet' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => tab.id === 'settings' ? onOpenSettings() : onSelectTab(tab.id)}
            className={`px-2.5 py-1 rounded font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
