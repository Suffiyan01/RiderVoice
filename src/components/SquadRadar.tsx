import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Plus, 
  Users, 
  Battery, 
  Radio, 
  Eye, 
  Crosshair,
  Flame,
  Check,
  Fuel
} from 'lucide-react';
import { Rider, HazardAlert } from '../types';
import { audioEffects } from '../services/audioEffects';

interface SquadRadarProps {
  riders: Rider[];
  hazards: HazardAlert[];
  onAddHazard: (hazard: HazardAlert) => void;
  onHailRider: (rider: Rider) => void;
}

export const SquadRadar: React.FC<SquadRadarProps> = ({
  riders,
  hazards,
  onAddHazard,
  onHailRider,
}) => {
  const [selectedHazardType, setSelectedHazardType] = useState<HazardAlert['type']>('pothole');
  const [hazardTitle, setHazardTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [radarZoom, setRadarZoom] = useState<1 | 2 | 5>(1); // 1km, 2km, 5km range

  const maxRangeMeters = radarZoom * 1000;

  // Compute position on 200x200 radar coordinate space
  const calculateRadarPos = (distanceMeters: number, bearingDeg: number) => {
    const clampedDist = Math.min(distanceMeters, maxRangeMeters);
    const radiusRatio = clampedDist / maxRangeMeters; // 0 to 1
    const maxRadiusPx = 135; // radar radius from center
    const r = radiusRatio * maxRadiusPx;
    // 0 deg is North (top), 90 is East (right)
    const rad = ((bearingDeg - 90) * Math.PI) / 180;
    const x = 160 + r * Math.cos(rad);
    const y = 160 + r * Math.sin(rad);
    return { x, y };
  };

  const handleCreateHazard = (e: React.FormEvent) => {
    e.preventDefault();
    const newHazard: HazardAlert = {
      id: 'haz-' + Date.now(),
      type: selectedHazardType,
      title: hazardTitle.trim() || `Reported ${selectedHazardType}`,
      reportedBy: 'You (Squad Lead)',
      distanceMeters: 50,
      bearingDeg: 0,
      timestamp: new Date(),
      votes: 1,
    };
    onAddHazard(newHazard);
    audioEffects.playHazardAlert();
    setHazardTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Radar Card Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-display font-bold text-white tracking-wide">
                TACTICAL SQUAD RADAR & HAZARDS
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Real-time bearing & proximity tracking of squad members and crowd-sourced hazards
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
              <span className="text-neutral-500 px-2">RANGE:</span>
              {([1, 2, 5] as const).map(zoom => (
                <button
                  key={zoom}
                  onClick={() => setRadarZoom(zoom)}
                  className={`px-2 py-1 rounded transition ${
                    radarZoom === zoom ? 'bg-cyan-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {zoom}km
                </button>
              ))}
            </div>

            {/* Quick Drop Hazard Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-amber-950/40"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>LOG HAZARD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Radar Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Tactical Radar Display (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[420px]">
          {/* Radar Screen Area */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-cyan-800/60 bg-neutral-950 flex items-center justify-center shadow-2xl overflow-hidden">
            
            {/* Concentric distance rings */}
            <div className="absolute w-3/4 h-3/4 rounded-full border border-neutral-800/80 pointer-events-none" />
            <div className="absolute w-1/2 h-1/2 rounded-full border border-neutral-800/80 pointer-events-none" />
            <div className="absolute w-1/4 h-1/4 rounded-full border border-neutral-800/80 pointer-events-none" />

            {/* Crosshair axis lines */}
            <div className="absolute inset-x-0 h-[1px] bg-neutral-800 pointer-events-none" />
            <div className="absolute inset-y-0 w-[1px] bg-neutral-800 pointer-events-none" />

            {/* Radar Beam Sweep */}
            <div className="absolute inset-0 animate-radar-sweep pointer-events-none">
              <div 
                className="w-1/2 h-1/2 origin-bottom-right"
                style={{
                  background: 'conic-gradient(from 180deg at 100% 100%, rgba(6,182,212,0.3) 0deg, transparent 60deg)',
                }}
              />
            </div>

            {/* Center: The Rider's Bike */}
            <div className="relative z-20 flex flex-col items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_rgba(6,182,212,1)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
              </div>
              <span className="text-[9px] font-mono font-bold text-cyan-300 mt-1 uppercase tracking-wider bg-black/80 px-1 rounded">
                YOU
              </span>
            </div>

            {/* Plotted Squad Riders on Radar */}
            {riders.map((r) => {
              const pos = calculateRadarPos(r.distanceMeters, r.bearingDeg);
              return (
                <div
                  key={r.id}
                  style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                  title={`${r.name} (${r.distanceMeters}m)`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  onClick={() => onHailRider(r)}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center transition ${
                    r.isTalking 
                      ? 'bg-rose-500 animate-ping' 
                      : r.isOnline 
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
                      : 'bg-neutral-600'
                  }`} />
                  <div className="opacity-0 group-hover:opacity-100 transition absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-black/90 border border-neutral-700 text-[10px] font-mono text-white whitespace-nowrap pointer-events-none">
                    {r.callsign} ({r.distanceMeters}m)
                  </div>
                </div>
              );
            })}

            {/* Plotted Hazards on Radar */}
            {hazards.map((h) => {
              const pos = calculateRadarPos(h.distanceMeters, h.bearingDeg);
              return (
                <div
                  key={h.id}
                  style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                  title={`${h.title} (${h.distanceMeters}m)`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
                >
                  <div className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-300 flex items-center justify-center animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.9)]">
                    <span className="text-[9px] font-bold text-black">!</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-amber-950 border border-amber-600 text-[10px] font-mono text-amber-200 whitespace-nowrap pointer-events-none">
                    {h.title} ({h.distanceMeters}m)
                  </div>
                </div>
              );
            })}

            {/* Cardinal direction labels */}
            <span className="absolute top-2 font-mono text-[11px] font-bold text-neutral-400">N</span>
            <span className="absolute bottom-2 font-mono text-[11px] font-bold text-neutral-400">S</span>
            <span className="absolute left-2 font-mono text-[11px] font-bold text-neutral-400">W</span>
            <span className="absolute right-2 font-mono text-[11px] font-bold text-neutral-400">E</span>
          </div>

          <div className="flex items-center gap-4 mt-6 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Squad Rider</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Road Hazard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Your Bike</span>
            </div>
          </div>
        </div>

        {/* Right: Active Road Hazards & Squad Positions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Hazards List */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="font-display font-bold text-sm text-white tracking-wide">
                  REPORTED HAZARDS ({hazards.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">LIVE FEED</span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {hazards.map((haz) => (
                <div
                  key={haz.id}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">{haz.title}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Reported by <strong className="text-neutral-300">{haz.reportedBy}</strong>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-neutral-400">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                          {haz.votes} confirmations
                        </span>
                        <span>{haz.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-bold text-amber-400">{haz.distanceMeters}m</span>
                    <div className="text-[10px] font-mono text-neutral-400">DISTANCE</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Quick Hazard Report Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-lg text-white">Broadcast Road Hazard</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHazard} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-2">
                  HAZARD CATEGORY
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pothole', label: 'Pothole' },
                    { id: 'police', label: 'Speed Trap' },
                    { id: 'debris', label: 'Debris' },
                    { id: 'accident', label: 'Accident' },
                    { id: 'heavy_rain', label: 'Slick Road' },
                    { id: 'fuel', label: 'Oil Spill' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedHazardType(cat.id as HazardAlert['type'])}
                      className={`p-2 rounded-xl text-xs font-semibold border transition ${
                        selectedHazardType === cat.id
                          ? 'bg-amber-500 text-black border-amber-400 font-bold'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                  DESCRIPTION (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={hazardTitle}
                  onChange={(e) => setHazardTitle(e.target.value)}
                  placeholder="e.g. Deep pothole right in apex lane..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs hover:bg-neutral-700"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                >
                  BROADCAST TO SQUAD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
