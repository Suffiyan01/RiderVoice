import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CockpitDashboard } from './components/CockpitDashboard';
import { IntercomPanel } from './components/IntercomChannel';
import { VoiceAssistantHUD } from './components/VoiceAssistantHUD';
import { SquadRadar } from './components/SquadRadar';
import { TripMemos } from './components/TripMemos';
import { HelmetSettingsModal } from './components/HelmetSettings';
import { SosModal } from './components/SosModal';
import { 
  INITIAL_CHANNELS, 
  INITIAL_RIDERS, 
  INITIAL_HAZARDS 
} from './services/mockRiders';
import { 
  HelmetAudioConfig, 
  IntercomChannel, 
  RideTelemetry, 
  Rider, 
  HazardAlert, 
  VoiceCommandRecord, 
  VoiceMemo 
} from './types';
import { audioEffects } from './services/audioEffects';
import { speechService } from './services/speechService';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('cockpit');
  const [isSunlightMode, setIsSunlightMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [speedUnit, setSpeedUnit] = useState<'kmh' | 'mph'>('kmh');

  // Intercom & Helmet State
  const [channels] = useState<IntercomChannel[]>(INITIAL_CHANNELS);
  const [activeChannel, setActiveChannel] = useState<IntercomChannel>(INITIAL_CHANNELS[0]);
  const [riders, setRiders] = useState<Rider[]>(INITIAL_RIDERS);
  const [hazards, setHazards] = useState<HazardAlert[]>(INITIAL_HAZARDS);

  const [helmetConfig, setHelmetConfig] = useState<HelmetAudioConfig>({
    voxSensitivity: 6,
    isVoxActive: true,
    noiseSuppression: 'adaptive',
    intercomVolume: 85,
    navVolume: 90,
    musicVolume: 60,
    autoDuckMusic: true,
    connectedDevice: 'Cardo Packtalk Edge',
    batteryPercentage: 86,
    isConnected: true,
    lowLatencyMode: true,
  });

  // Telemetry
  const [telemetry, setTelemetry] = useState<RideTelemetry>({
    currentSpeed: 78,
    topSpeed: 114,
    avgSpeed: 68.4,
    distanceKm: 24.6,
    elevationMeters: 284,
    headingDeg: 342,
    rideDurationSec: 1320,
    isRiding: true,
    leanAngleDeg: 14,
  });

  // Voice Interaction Logs & Memos
  const [commands, setCommands] = useState<VoiceCommandRecord[]>([
    {
      id: 'cmd-init-1',
      timestamp: new Date(Date.now() - 3 * 60000),
      rawQuery: 'Check speed',
      detectedIntent: 'speed',
      spokenResponse: 'Current speed is 78 kilometers per hour. Speed limit here is 80.',
      status: 'executed',
    },
    {
      id: 'cmd-init-2',
      timestamp: new Date(Date.now() - 7 * 60000),
      rawQuery: 'Where is the nearest gas?',
      detectedIntent: 'nav',
      spokenResponse: 'Nearest Shell gas station is 3.2 kilometers ahead on Route 9.',
      status: 'executed',
    },
  ]);

  const [memos, setMemos] = useState<VoiceMemo[]>([
    {
      id: 'memo-1',
      timestamp: new Date(Date.now() - 15 * 60000),
      transcript: 'Look out for gravel shoulder near the Big Sur lighthouse turnoff.',
      durationSec: 5,
      speedAtRecording: 64,
      locationTag: 'Scenic Coast Mile 14',
    },
  ]);

  // Handle new hazard
  const handleAddHazard = (hazard: HazardAlert) => {
    setHazards(prev => [hazard, ...prev]);
    // Notify in helmet
    speechService.speak(`Hazard logged: ${hazard.title}. Broadcaster: squad lead.`);
  };

  // Direct hail squad rider
  const handleHailRider = (rider: Rider) => {
    setActiveTab('intercom');
    audioEffects.playMicOpen();
    speechService.speak(`Connecting private direct intercom hail to ${rider.callsign}.`);
  };

  // Emergency SOS dispatch
  const handleConfirmDispatch = () => {
    // Switch to Emergency Channel
    const sosChannel = channels.find(c => c.isEmergency) || channels[0];
    setActiveChannel(sosChannel);
    speechService.speak('Emergency distress signal broadcasting on Channel 09. Location coordinates locked.');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      isSunlightMode ? 'bg-neutral-900 text-neutral-50' : 'bg-neutral-950 text-neutral-100'
    }`}>
      {/* Top Bar */}
      <Header
        helmetConfig={helmetConfig}
        activeChannel={activeChannel}
        isSunlightMode={isSunlightMode}
        onToggleSunlightMode={() => setIsSunlightMode(prev => !prev)}
        onTriggerSos={() => setIsSosOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-24">
        {activeTab === 'cockpit' && (
          <CockpitDashboard
            telemetry={telemetry}
            setTelemetry={setTelemetry}
            hazards={hazards}
            onTriggerVoiceAssistant={() => setActiveTab('assistant')}
            onOpenIntercom={() => setActiveTab('intercom')}
            isMicActive={false}
            unit={speedUnit}
            onToggleUnit={() => setSpeedUnit(u => u === 'kmh' ? 'mph' : 'kmh')}
          />
        )}

        {activeTab === 'intercom' && (
          <IntercomPanel
            channels={channels}
            activeChannel={activeChannel}
            onSelectChannel={setActiveChannel}
            riders={riders}
            setRiders={setRiders}
            helmetConfig={helmetConfig}
            setHelmetConfig={setHelmetConfig}
          />
        )}

        {activeTab === 'assistant' && (
          <VoiceAssistantHUD
            telemetry={telemetry}
            commands={commands}
            onNewCommand={(cmd) => setCommands(c => [cmd, ...c])}
            onTriggerSos={() => setIsSosOpen(true)}
          />
        )}

        {activeTab === 'radar' && (
          <SquadRadar
            riders={riders}
            hazards={hazards}
            onAddHazard={handleAddHazard}
            onHailRider={handleHailRider}
          />
        )}

        {activeTab === 'memos' && (
          <TripMemos
            memos={memos}
            setMemos={setMemos}
            telemetry={telemetry}
          />
        )}
      </main>

      {/* Floating Glove PTT Quick Action Pill (when not on Intercom tab) */}
      {activeTab !== 'intercom' && (
        <aside aria-label="Quick Controls" className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('intercom')}
            className="px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl shadow-cyan-950 border border-cyan-300 active:scale-95 transition"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
            <span>QUICK PTT RADIO</span>
          </button>
        </aside>
      )}

      {/* Helmet Settings Modal */}
      <HelmetSettingsModal
        config={helmetConfig}
        setConfig={setHelmetConfig}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Emergency SOS Modal */}
      <SosModal
        isOpen={isSosOpen}
        onCancel={() => setIsSosOpen(false)}
        onConfirmDispatch={handleConfirmDispatch}
      />
    </div>
  );
};
