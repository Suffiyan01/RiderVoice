import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Gauge, 
  MapPin, 
  Mic, 
  Navigation, 
  TrendingUp, 
  Clock, 
  Mountain, 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  ShieldCheck,
  Radio,
  Volume2
} from 'lucide-react';
import { RideTelemetry, HazardAlert } from '../types';

interface CockpitDashboardProps {
  telemetry: RideTelemetry;
  setTelemetry: React.Dispatch<React.SetStateAction<RideTelemetry>>;
  hazards: HazardAlert[];
  onTriggerVoiceAssistant: () => void;
  onOpenIntercom: () => void;
  isMicActive: boolean;
  unit: 'kmh' | 'mph';
  onToggleUnit: () => void;
}

export const CockpitDashboard: React.FC<CockpitDashboardProps> = ({
  telemetry,
  setTelemetry,
  hazards,
  onTriggerVoiceAssistant,
  onOpenIntercom,
  isMicActive,
  unit,
  onToggleUnit,
}) => {
  const [simulationProfile, setSimulationProfile] = useState<'highway' | 'twisties' | 'city' | 'idle'>('highway');

  // Convert speed according to unit
  const displaySpeed = unit === 'mph' ? Math.round(telemetry.currentSpeed * 0.621371) : Math.round(telemetry.currentSpeed);
  const displayTopSpeed = unit === 'mph' ? Math.round(telemetry.topSpeed * 0.621371) : Math.round(telemetry.topSpeed);
  const displayAvgSpeed = unit === 'mph' ? Math.round(telemetry.avgSpeed * 0.621371) : Math.round(telemetry.avgSpeed);
  const speedUnitLabel = unit === 'mph' ? 'MPH' : 'KM/H';
  const speedLimit = unit === 'mph' ? 50 : 80;
  const isSpeeding = displaySpeed > speedLimit;

  // Format ride time hh:mm:ss
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Convert heading deg to Cardinal
  const getCompassDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(((deg % 360) / 45)) % 8;
    return directions[idx];
  };

  // Simulation tick loop for dynamic dashboard experience
  useEffect(() => {
    if (!telemetry.isRiding) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        let targetSpeed = 75;
        let leanVariance = 0;
        let headingDrift = 0;

        if (simulationProfile === 'highway') {
          targetSpeed = 105 + (Math.sin(Date.now() / 2500) * 12);
          leanVariance = Math.sin(Date.now() / 4000) * 8;
          headingDrift = Math.sin(Date.now() / 8000) * 4;
        } else if (simulationProfile === 'twisties') {
          targetSpeed = 62 + (Math.sin(Date.now() / 1500) * 25);
          leanVariance = Math.sin(Date.now() / 1200) * 32; // deep leaning in corners
          headingDrift = Math.sin(Date.now() / 2000) * 45;
        } else if (simulationProfile === 'city') {
          targetSpeed = 38 + (Math.sin(Date.now() / 2000) * 18);
          leanVariance = Math.sin(Date.now() / 2200) * 12;
          headingDrift = (prev.headingDeg + 1) % 360;
        } else {
          targetSpeed = 0;
          leanVariance = 0;
        }

        const newSpeed = Math.max(0, Math.round(targetSpeed + (Math.random() * 2 - 1)));
        const newTop = Math.max(prev.topSpeed, newSpeed);
        const newDist = prev.distanceKm + (newSpeed / 3600);
        const newDuration = prev.rideDurationSec + 1;
        const newAvg = Number((newDist / (newDuration / 3600)).toFixed(1));
        const newHeading = (Math.round(prev.headingDeg + headingDrift) + 360) % 360;
        const newElev = Math.round(prev.elevationMeters + (Math.sin(Date.now() / 5000) * 0.8));

        return {
          ...prev,
          currentSpeed: newSpeed,
          topSpeed: newTop,
          avgSpeed: isNaN(newAvg) ? 0 : newAvg,
          distanceKm: Number(newDist.toFixed(2)),
          rideDurationSec: newDuration,
          leanAngleDeg: Math.round(leanVariance),
          headingDeg: newHeading,
          elevationMeters: newElev,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [telemetry.isRiding, simulationProfile, setTelemetry]);

  // Nearest hazard
  const nearestHazard = hazards[0];

  return (
    <div className="space-y-4">
      {/* Top Banner: Road Name & Live Hazard Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-neutral-400">Current Route</div>
              <div className="text-sm font-bold text-white tracking-wide">Pacific Coast Hwy 1 • Northbound</div>
            </div>
          </div>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
            GPS LOCK 3D
          </span>
        </div>

        {/* Hazard alert pill */}
        {nearestHazard ? (
          <div className="bg-amber-950/40 border border-amber-600/60 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center animate-bounce">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono text-amber-400 font-bold">Upcoming Hazard Alert</div>
                <div className="text-xs font-semibold text-neutral-200 truncate max-w-[200px]">{nearestHazard.title}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-bold text-amber-300">{nearestHazard.distanceMeters}m</span>
              <div className="text-[10px] text-neutral-400 font-mono">AHEAD</div>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div className="text-xs text-neutral-300">Route clear. No hazards reported within 5km.</div>
          </div>
        )}

        {/* Ride Status & Simulation Controls */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTelemetry(t => ({ ...t, isRiding: !t.isRiding }))}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                telemetry.isRiding 
                  ? 'bg-amber-500 hover:bg-amber-400 text-black' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black'
              }`}
            >
              {telemetry.isRiding ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
              <span>{telemetry.isRiding ? 'PAUSE' : 'RECORD RIDE'}</span>
            </button>
            <button
              onClick={() => setTelemetry(t => ({ ...t, distanceKm: 0, rideDurationSec: 0, topSpeed: 0, avgSpeed: 0 }))}
              title="Reset Trip Odometer"
              className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[11px] font-mono">
            {(['twisties', 'highway', 'city', 'idle'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setSimulationProfile(mode)}
                className={`px-1.5 py-0.5 rounded capitalize ${
                  simulationProfile === mode ? 'bg-cyan-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Cockpit HUD Cluster */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Wing: Telemetry gauges & lean angle */}
          <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            {/* Lean Angle Gauge */}
            <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span className="font-mono uppercase text-[11px] tracking-wider">Lean Angle</span>
                <span className="font-mono text-cyan-400 font-bold">{Math.abs(telemetry.leanAngleDeg)}° {telemetry.leanAngleDeg < 0 ? 'LEFT' : telemetry.leanAngleDeg > 0 ? 'RIGHT' : 'CTR'}</span>
              </div>
              
              {/* Leaning horizon visualizer */}
              <div className="h-10 bg-neutral-900 rounded-lg relative overflow-hidden flex items-center justify-center border border-neutral-800">
                <div className="absolute inset-x-0 h-[1px] bg-neutral-700" />
                <div className="w-[1px] h-full bg-neutral-600" />
                {/* Leaning horizon line */}
                <div 
                  className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transition-transform duration-300"
                  style={{ transform: `rotate(${-telemetry.leanAngleDeg}deg)` }}
                />
                {/* Center marker */}
                <div className="w-2 h-2 rounded-full border border-cyan-300 absolute" />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-1">
                <span>-45°</span>
                <span>0°</span>
                <span>+45°</span>
              </div>
            </div>

            {/* Compass & Heading */}
            <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono text-neutral-400">Heading</div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-display font-bold text-white tracking-wider">
                    {telemetry.headingDeg}°
                  </span>
                  <span className="text-sm font-mono font-bold text-cyan-400">
                    {getCompassDirection(telemetry.headingDeg)}
                  </span>
                </div>
              </div>

              {/* Mini Compass Rose */}
              <div className="w-12 h-12 rounded-full border border-neutral-700 bg-neutral-900 relative flex items-center justify-center shadow-inner">
                <div 
                  className="w-1 h-9 rounded bg-gradient-to-b from-rose-500 via-neutral-300 to-cyan-500 transition-transform duration-300"
                  style={{ transform: `rotate(${telemetry.headingDeg}deg)` }}
                />
                <div className="w-2 h-2 rounded-full bg-white absolute" />
              </div>
            </div>

            {/* Elevation */}
            <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mountain className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-[10px] uppercase font-mono text-neutral-400">GPS Elevation</div>
                  <div className="text-lg font-display font-bold text-white">{telemetry.elevationMeters} m</div>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                +42m ascent
              </span>
            </div>
          </div>

          {/* Center: Massive Digital Speedometer */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2 py-2">
            
            {/* Speed Dial Arc Frame */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Outer circular track */}
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                {/* Background Track */}
                <circle
                  cx="100"
                  cy="100"
                  r="82"
                  className="stroke-neutral-800"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="380"
                  strokeDashoffset="75"
                  strokeLinecap="round"
                />
                {/* Active Speed Arc */}
                <circle
                  cx="100"
                  cy="100"
                  r="82"
                  className={`transition-all duration-300 ${
                    isSpeeding 
                      ? 'stroke-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]' 
                      : 'stroke-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                  }`}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="380"
                  strokeDashoffset={Math.max(75, 380 - (displaySpeed / (unit === 'mph' ? 120 : 180)) * 305)}
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Speed Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {/* Speed Limit indicator */}
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                    isSpeeding 
                      ? 'bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse' 
                      : 'bg-neutral-900 text-neutral-400 border-neutral-700'
                  }`}>
                    LIMIT {speedLimit} {speedUnitLabel}
                  </div>
                </div>

                {/* Massive Number */}
                <div className={`text-6xl sm:text-7xl font-display font-extrabold tracking-tighter leading-none ${
                  isSpeeding ? 'text-rose-400 animate-pulse' : 'text-white'
                }`}>
                  {displaySpeed}
                </div>

                <button
                  onClick={onToggleUnit}
                  title="Click to toggle KM/H and MPH"
                  className="mt-1 flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 bg-neutral-900/80 px-2 py-0.5 rounded border border-neutral-800"
                >
                  <span>{speedUnitLabel}</span>
                  <span className="text-[10px] text-neutral-500 underline">toggle</span>
                </button>

                {/* Status indicator below speed */}
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <span className={`w-2 h-2 rounded-full ${telemetry.isRiding ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
                  <span className="font-mono text-[11px] text-neutral-400">
                    {telemetry.isRiding ? 'RECORDING TELEMETRY' : 'STANDBY'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Hands-Free Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <button
                onClick={onTriggerVoiceAssistant}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm tracking-wide flex items-center gap-2.5 shadow-lg shadow-cyan-900/40 border border-cyan-400/30 active:scale-95 transition"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Mic className="w-3.5 h-3.5 text-white" />
                </div>
                <span>VOICE ASSISTANT</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">"Hey Rider"</span>
              </button>

              <button
                onClick={onOpenIntercom}
                className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold text-sm flex items-center gap-2 border border-neutral-700 active:scale-95 transition"
              >
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>OPEN SQUAD RADIO</span>
              </button>
            </div>
          </div>

          {/* Right Wing: Trip statistics & performance metrics */}
          <div className="lg:col-span-3 space-y-4 order-3">
            {/* Distance Odometer */}
            <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono text-neutral-400">Trip Distance</div>
                <div className="text-2xl font-display font-bold text-white mt-0.5">
                  {unit === 'mph' ? (telemetry.distanceKm * 0.621371).toFixed(1) : telemetry.distanceKm.toFixed(1)}
                  <span className="text-xs font-mono text-neutral-400 ml-1">{unit === 'mph' ? 'mi' : 'km'}</span>
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>

            {/* Ride Duration */}
            <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono text-neutral-400">Ride Elapsed Time</div>
                <div className="text-2xl font-display font-bold text-white mt-0.5">
                  {formatTime(telemetry.rideDurationSec)}
                </div>
              </div>
              <Clock className="w-6 h-6 text-amber-400" />
            </div>

            {/* Top & Average Speeds */}
            <div className="bg-neutral-950/90 border border-neutral-800/80 rounded-xl p-3.5 grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] uppercase font-mono text-neutral-400">Top Speed</div>
                <div className="text-lg font-display font-bold text-rose-400">
                  {displayTopSpeed} <span className="text-[10px] font-mono text-neutral-400">{speedUnitLabel}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono text-neutral-400">Avg Speed</div>
                <div className="text-lg font-display font-bold text-emerald-400">
                  {displayAvgSpeed} <span className="text-[10px] font-mono text-neutral-400">{speedUnitLabel}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
