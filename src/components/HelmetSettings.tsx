import React from 'react';
import { 
  Headphones, 
  Bluetooth, 
  Battery, 
  Sliders, 
  Wind, 
  Volume2, 
  ShieldCheck, 
  Music, 
  Navigation, 
  Radio,
  Zap,
  Check
} from 'lucide-react';
import { HelmetAudioConfig } from '../types';
import { audioEffects } from '../services/audioEffects';

interface HelmetSettingsProps {
  config: HelmetAudioConfig;
  setConfig: React.Dispatch<React.SetStateAction<HelmetAudioConfig>>;
  isOpen: boolean;
  onClose: () => void;
}

export const HelmetSettingsModal: React.FC<HelmetSettingsProps> = ({
  config,
  setConfig,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const devices = [
    'Cardo Packtalk Edge',
    'Sena 50S Mesh 3.0',
    'FreedConn FX Pro',
    'Lexin B4FM',
    'AirPods Pro (Helmet Fit)',
  ];

  const handleTestAudio = () => {
    audioEffects.playRogerBeep();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white tracking-wide">
                HELMET & AUDIO CONFIGURATION
              </h2>
              <p className="text-xs text-neutral-400">
                Bluetooth headset profiles, wind noise DSP filter, and audio ducking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center font-mono text-xs transition"
          >
            ✕
          </button>
        </div>

        {/* Headset Device Selector */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-neutral-400 flex items-center justify-between">
            <span>PAIRED BLUETOOTH COMM SYSTEM</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Bluetooth className="w-3.5 h-3.5" />
              CONNECTED ({config.batteryPercentage}%)
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {devices.map((device) => {
              const isSelected = config.connectedDevice === device;
              return (
                <button
                  key={device}
                  type="button"
                  onClick={() => setConfig(c => ({ ...c, connectedDevice: device }))}
                  className={`p-2.5 rounded-xl text-left border text-xs font-medium transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="truncate">{device}</span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Wind Noise Suppression DSP */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white">
                WIND NOISE FILTER & MIC GATE
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 uppercase">
              {config.noiseSuppression} DSP
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            {(['off', 'adaptive', 'aggressive'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setConfig(c => ({ ...c, noiseSuppression: mode }))}
                className={`py-2 rounded-xl border capitalize font-semibold transition ${
                  config.noiseSuppression === mode
                    ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {mode === 'aggressive' ? 'High Speed' : mode}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-neutral-400">
            {config.noiseSuppression === 'aggressive'
              ? 'Aggressive 140Hz high-pass filter + dynamic noise gate optimized for 120+ km/h highway wind turbulence.'
              : 'Adaptive notch filtering to eliminate engine rumble and exhaust drone.'}
          </p>
        </div>

        {/* 3-Channel Audio Volume Mixer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-400">HELMET AUDIO MIXER</span>
            <button
              onClick={handleTestAudio}
              className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Test Helmet Beep</span>
            </button>
          </div>

          {/* Intercom Channel */}
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Intercom & Squad Voices
              </span>
              <span className="font-mono text-cyan-400">{config.intercomVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.intercomVolume}
              onChange={(e) => setConfig(c => ({ ...c, intercomVolume: Number(e.target.value) }))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Nav Prompts */}
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                GPS Turn-by-Turn & Speed Alerts
              </span>
              <span className="font-mono text-emerald-400">{config.navVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.navVolume}
              onChange={(e) => setConfig(c => ({ ...c, navVolume: Number(e.target.value) }))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Background Music */}
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                Music & Media Streaming
              </span>
              <span className="font-mono text-amber-400">{config.musicVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.musicVolume}
              onChange={(e) => setConfig(c => ({ ...c, musicVolume: Number(e.target.value) }))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Smart Toggles: Auto-Ducking & Low Latency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
          <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer">
            <div className="pr-2">
              <div className="text-xs font-bold text-white">Auto-Duck Music</div>
              <div className="text-[10px] text-neutral-400">Lower music 80% during voice</div>
            </div>
            <input
              type="checkbox"
              checked={config.autoDuckMusic}
              onChange={(e) => setConfig(c => ({ ...c, autoDuckMusic: e.target.checked }))}
              className="w-4 h-4 accent-cyan-400 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer">
            <div className="pr-2">
              <div className="text-xs font-bold text-white">Mesh Low-Latency</div>
              <div className="text-[10px] text-neutral-400">12ms uncompressed audio</div>
            </div>
            <input
              type="checkbox"
              checked={config.lowLatencyMode}
              onChange={(e) => setConfig(c => ({ ...c, lowLatencyMode: e.target.checked }))}
              className="w-4 h-4 accent-cyan-400 rounded"
            />
          </label>
        </div>

        {/* Footer Done */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-sm tracking-wide transition shadow-lg shadow-cyan-950/50"
        >
          SAVE & RETURN TO RIDE
        </button>

      </div>
    </div>
  );
};
