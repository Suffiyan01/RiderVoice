import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Mic, 
  MicOff, 
  Users, 
  Volume2, 
  VolumeX, 
  Shield, 
  Lock, 
  Sliders, 
  Wifi, 
  WifiOff,
  Battery,
  MessageSquare,
  Sparkles,
  Play
} from 'lucide-react';
import { IntercomChannel, Rider, HelmetAudioConfig } from '../types';
import { audioEffects } from '../services/audioEffects';

interface IntercomChannelProps {
  channels: IntercomChannel[];
  activeChannel: IntercomChannel;
  onSelectChannel: (channel: IntercomChannel) => void;
  riders: Rider[];
  setRiders: React.Dispatch<React.SetStateAction<Rider[]>>;
  helmetConfig: HelmetAudioConfig;
  setHelmetConfig: React.Dispatch<React.SetStateAction<HelmetAudioConfig>>;
}

export const IntercomPanel: React.FC<IntercomChannelProps> = ({
  channels,
  activeChannel,
  onSelectChannel,
  riders,
  setRiders,
  helmetConfig,
  setHelmetConfig,
}) => {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [radioLog, setRadioLog] = useState<Array<{ id: string; sender: string; text: string; time: string; isSelf?: boolean }>>([
    {
      id: '1',
      sender: 'Alex "Apex" Mercer',
      text: 'Radio check, squad. We have green lights on the pass.',
      time: '2m ago',
    },
    {
      id: '2',
      sender: 'Sarah "Valkyrie"',
      text: 'Loud and clear. Maintaining 50m formation spacing.',
      time: '1m ago',
    },
  ]);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Handle Starting PTT (Push to talk)
  const startTransmitting = async () => {
    if (isTransmitting) return;
    setIsTransmitting(true);
    audioEffects.playMicOpen();

    // Try real microphone access if available
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkAudio = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 255) * 100)));
          animFrameRef.current = requestAnimationFrame(checkAudio);
        };
        checkAudio();
      } else {
        // Fallback simulation level
        setAudioLevel(65);
      }
    } catch {
      // Permission denied or unavailable - fallback to visual wave
      setAudioLevel(70);
    }
  };

  // Handle Stopping PTT
  const stopTransmitting = () => {
    if (!isTransmitting) return;
    setIsTransmitting(false);
    setAudioLevel(0);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    // Play classic helmet roger beep
    audioEffects.playRogerBeep();

    // Add entry to radio log
    setRadioLog(prev => [
      {
        id: Date.now().toString(),
        sender: 'You (Squad Lead)',
        text: 'Voice transmission over Mesh Channel.',
        time: 'Just now',
        isSelf: true,
      },
      ...prev,
    ]);
  };

  // Simulate incoming squad transmission
  const simulateSquadTransmission = (rider: Rider) => {
    audioEffects.playMicOpen();
    
    // Set rider as talking
    setRiders(prev => prev.map(r => r.id === rider.id ? { ...r, isTalking: true } : r));

    setTimeout(() => {
      audioEffects.playRogerBeep();
      setRiders(prev => prev.map(r => r.id === rider.id ? { ...r, isTalking: false } : r));
      
      const sampleMessages = [
        'Sweeper in position, clear road behind us.',
        'Approaching slow semi-truck ahead, get ready to pass on left.',
        'Taking the scenic detour through the canyon.',
        'Check tire pressure, feels a bit slippery on these wet patches.',
      ];
      const text = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

      setRadioLog(prev => [
        {
          id: Date.now().toString(),
          sender: rider.name,
          text,
          time: 'Just now',
        },
        ...prev,
      ]);
    }, 2800);
  };

  return (
    <div className="space-y-6">
      {/* Channel Selector Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-display font-bold text-white tracking-wide">
                TACTICAL MESH INTERCOM
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Encrypted ultra-low-latency full-duplex rider intercom (Bluetooth 5.4 & Dynamic Mesh Communication)
            </p>
          </div>

          {/* Quick VOX Toggle */}
          <div className="flex items-center gap-3 bg-neutral-950 p-2 rounded-xl border border-neutral-800 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-neutral-400">VOX Hands-Free</div>
              <div className="text-xs font-bold text-cyan-400 font-mono">
                {helmetConfig.isVoxActive ? 'AUTO-TRIGGER ON' : 'PTT ONLY'}
              </div>
            </div>
            <button
              onClick={() => setHelmetConfig(c => ({ ...c, isVoxActive: !c.isVoxActive }))}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                helmetConfig.isVoxActive ? 'bg-cyan-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  helmetConfig.isVoxActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Channel Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {channels.map((ch) => {
            const isSelected = ch.id === activeChannel.id;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  onSelectChannel(ch);
                  audioEffects.playMicOpen();
                }}
                className={`p-3 rounded-xl text-left border transition relative overflow-hidden ${
                  isSelected
                    ? ch.isEmergency
                      ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/30'
                      : 'bg-cyan-950/60 border-cyan-500 ring-2 ring-cyan-500/30'
                    : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {isSelected && (
                  <div className={`absolute top-0 right-0 w-2 h-2 rounded-bl ${ch.isEmergency ? 'bg-rose-500' : 'bg-cyan-400'}`} />
                )}
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs font-bold ${isSelected ? (ch.isEmergency ? 'text-rose-400' : 'text-cyan-300') : 'text-neutral-400'}`}>
                    {ch.frequency}
                  </span>
                  {ch.isEncrypted ? (
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                </div>
                <div className="font-bold text-sm text-white mt-1 truncate">{ch.name}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-neutral-400" />
                    <span>{ch.activeMembers} Riders</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">12ms LATENCY</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Interaction Area: Giant Glove-Friendly PTT & Audio Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Giant Glove PTT Button (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[380px]">
          {/* Active Broadcast Ambient Glow */}
          {isTransmitting && (
            <div className="absolute inset-0 bg-cyan-500/10 animate-pulse pointer-events-none" />
          )}

          <div className="text-center mb-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
              isTransmitting
                ? 'bg-rose-950 text-rose-400 border-rose-500 animate-pulse'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800'
            }`}>
              {isTransmitting ? 'TRANSMITTING ON MESH AIRWAVES' : 'READY TO TRANSMIT • PTT STANDBY'}
            </span>
            <div className="text-xs text-neutral-400 mt-2">
              Hold button to broadcast to all riders on <strong className="text-white">{activeChannel.name}</strong>
            </div>
          </div>

          {/* Massive PTT Circle Button */}
          <div className="relative">
            {/* Pulsing rings when transmitting */}
            {isTransmitting && (
              <>
                <div className="absolute -inset-4 rounded-full bg-cyan-500/20 animate-ping pointer-events-none" />
                <div className="absolute -inset-8 rounded-full bg-cyan-500/10 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              onMouseDown={startTransmitting}
              onMouseUp={stopTransmitting}
              onMouseLeave={stopTransmitting}
              onTouchStart={startTransmitting}
              onTouchEnd={stopTransmitting}
              className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center transition-all select-none shadow-2xl relative border-4 ${
                isTransmitting
                  ? 'bg-gradient-to-b from-rose-600 to-rose-700 border-rose-300 scale-95 shadow-[0_0_50px_rgba(244,63,94,0.6)]'
                  : 'bg-gradient-to-b from-neutral-800 to-neutral-950 border-cyan-500/40 hover:border-cyan-400 active:scale-95 shadow-[0_0_35px_rgba(6,182,212,0.25)]'
              }`}
            >
              <div className={`p-4 rounded-full mb-2 transition ${
                isTransmitting ? 'bg-white/20' : 'bg-neutral-800/80 text-cyan-400'
              }`}>
                {isTransmitting ? (
                  <Mic className="w-10 h-10 text-white animate-bounce" />
                ) : (
                  <Radio className="w-10 h-10 text-cyan-400" />
                )}
              </div>
              <span className="font-display font-black text-xl tracking-wider text-white">
                {isTransmitting ? 'TALKING...' : 'PUSH TO TALK'}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 mt-1">
                GLOVE COMPLIANT
              </span>
            </button>
          </div>

          {/* Visual Audio Frequency Bars */}
          <div className="w-full max-w-sm mt-8">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-1.5">
              <span>MIC AUDIO LEVEL</span>
              <span className={isTransmitting ? 'text-cyan-400 font-bold' : 'text-neutral-500'}>
                {isTransmitting ? `${audioLevel}% (GATE OPEN)` : '0% (SQUELCHED)'}
              </span>
            </div>
            <div className="flex items-center gap-1 h-8 bg-neutral-950 p-1.5 rounded-lg border border-neutral-800">
              {Array.from({ length: 24 }).map((_, i) => {
                const threshold = (i / 24) * 100;
                const isLit = isTransmitting && audioLevel >= threshold;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm transition-all duration-75 ${
                      isLit
                        ? i > 18
                          ? 'bg-rose-500 h-full'
                          : i > 12
                          ? 'bg-amber-400 h-4/5'
                          : 'bg-cyan-400 h-3/5'
                        : 'bg-neutral-800 h-1/4'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Squad Members & Simulation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-bold text-sm text-white tracking-wide">
                  ACTIVE SQUAD RIDERS ({riders.filter(r => r.isOnline).length})
                </h3>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">
                Tap to simulate incoming voice
              </span>
            </div>

            {/* Rider cards */}
            <div className="space-y-2.5">
              {riders.map((rider) => (
                <div
                  key={rider.id}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                    rider.isTalking
                      ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-500/50'
                      : rider.isOnline
                      ? 'bg-neutral-950/80 border-neutral-800'
                      : 'bg-neutral-950/40 border-neutral-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar with talking wave indicator */}
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${rider.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow`}>
                        {rider.name.charAt(0)}
                      </div>
                      {rider.isTalking && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white truncate">{rider.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                          {rider.callsign}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 truncate">{rider.bikeModel}</div>
                      {rider.isTalking && (
                        <div className="text-[11px] text-cyan-400 font-mono animate-pulse flex items-center gap-1 mt-0.5">
                          <Volume2 className="w-3 h-3" />
                          <span>SPEAKING TO SQUAD...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Battery & Distance */}
                    <div className="text-right text-[11px] font-mono text-neutral-400">
                      <div>{rider.distanceMeters}m away</div>
                      <div className="text-emerald-400 flex items-center justify-end gap-1">
                        <Battery className="w-3 h-3" />
                        <span>{rider.batteryLevel}%</span>
                      </div>
                    </div>

                    {/* Simulation button */}
                    <button
                      onClick={() => simulateSquadTransmission(rider)}
                      title="Simulate incoming radio message from this rider"
                      className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Radio Log */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                  RADIO CHATTER LOG
                </h4>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">ENCRYPTED AUDIT</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {radioLog.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded-lg text-xs border ${
                    log.isSelf
                      ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-0.5">
                    <span className="font-bold text-white">{log.sender}</span>
                    <span>{log.time}</span>
                  </div>
                  <div>{log.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
