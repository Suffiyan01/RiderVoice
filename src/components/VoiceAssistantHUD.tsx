import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  Send, 
  Navigation, 
  Fuel, 
  CloudRain, 
  AlertTriangle, 
  Radio, 
  RotateCcw,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { VoiceCommandRecord, RideTelemetry } from '../types';
import { speechService } from '../services/speechService';
import { audioEffects } from '../services/audioEffects';

interface VoiceAssistantHUDProps {
  telemetry: RideTelemetry;
  commands: VoiceCommandRecord[];
  onNewCommand: (cmd: VoiceCommandRecord) => void;
  onTriggerSos: () => void;
}

export const VoiceAssistantHUD: React.FC<VoiceAssistantHUDProps> = ({
  telemetry,
  commands,
  onNewCommand,
  onTriggerSos,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [isSpeakingResponse, setIsSpeakingResponse] = useState(false);

  useEffect(() => {
    speechService.setCallbacks(
      (cmd) => {
        onNewCommand(cmd);
        setIsListening(false);
        setInterimText('');
        setIsSpeakingResponse(true);
        setTimeout(() => setIsSpeakingResponse(false), 3000);
      },
      (text) => {
        setInterimText(text);
      }
    );
  }, [onNewCommand]);

  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      setInterimText('');
      audioEffects.playAssistantListen();
      speechService.startListening();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const cmd = speechService.processVoiceCommand(manualInput.trim(), telemetry.currentSpeed);
    onNewCommand(cmd);
    setManualInput('');
  };

  const executePreset = (phrase: string) => {
    audioEffects.playAssistantListen();
    const cmd = speechService.processVoiceCommand(phrase, telemetry.currentSpeed);
    onNewCommand(cmd);
  };

  return (
    <div className="space-y-6">
      {/* Voice Assistant Core Interface */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-mono text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI HELMET COPILOT • NATURAL VOICE ENGINE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
            Hands-Free Rider Voice Assistant
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Speak naturally through your helmet microphone. Answers are read aloud directly through your intercom speakers.
          </p>

          {/* Central Microphone Touch Target */}
          <div className="my-8 relative">
            {isListening && (
              <div className="absolute -inset-6 rounded-full bg-cyan-500/20 animate-ping pointer-events-none" />
            )}

            <button
              onClick={toggleListening}
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl relative border-4 active:scale-95 ${
                isListening
                  ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 border-white text-neutral-950 shadow-[0_0_50px_rgba(6,182,212,0.6)] animate-pulse'
                  : 'bg-neutral-950 border-neutral-700 hover:border-cyan-400 text-cyan-400 shadow-[0_0_30px_rgba(0,0,0,0.8)]'
              }`}
            >
              {isListening ? (
                <Mic className="w-12 h-12 text-white animate-bounce" />
              ) : (
                <Mic className="w-12 h-12" />
              )}
              <span className="font-mono text-[10px] font-bold tracking-wider uppercase mt-1">
                {isListening ? 'LISTENING...' : 'TAP TO SPEAK'}
              </span>
            </button>
          </div>

          {/* Real-time Transcription Stream or Spoken Response */}
          <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 min-h-[72px] flex items-center justify-center">
            {interimText ? (
              <div className="text-cyan-400 font-mono text-sm animate-pulse">
                "{interimText}"
              </div>
            ) : isListening ? (
              <div className="text-neutral-400 text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Listening for helmet voice command...
              </div>
            ) : commands.length > 0 ? (
              <div className="text-neutral-200 text-xs sm:text-sm font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{commands[0].spokenResponse}</span>
              </div>
            ) : (
              <div className="text-neutral-500 text-xs font-mono">
                Say "Check speed", "Where is the nearest gas?", or choose a quick command below.
              </div>
            )}
          </div>

          {/* Quick Command Action Chips for Instant Riding Access */}
          <div className="w-full mt-6">
            <div className="text-left text-[11px] font-mono text-neutral-400 mb-2">
              QUICK COMMANDS (TAP OR SAY):
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: 'Check speed', icon: Navigation, query: 'What is my current speed?' },
                { label: 'Nearest Gas Station', icon: Fuel, query: 'Where is the nearest gas station?' },
                { label: 'Weather Forecast', icon: CloudRain, query: 'What is the weather ahead?' },
                { label: 'Report Road Hazard', icon: AlertTriangle, query: 'Report a road hazard' },
                { label: 'Intercom Status', icon: Radio, query: 'Intercom channel status' },
                { label: 'Adjust Audio Volume', icon: Headphones, query: 'Set helmet volume to 75%' },
              ].map((chip) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.label}
                    onClick={() => executePreset(chip.query)}
                    className="px-3 py-2 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500/50 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Text Command Input Bar */}
          <form onSubmit={handleManualSubmit} className="w-full mt-6 flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or type voice command (e.g., 'How far to next gas?')..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SEND</span>
            </button>
          </form>
        </div>
      </div>

      {/* Voice Command Activity History */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-sm text-white tracking-wide">
              VOICE INTERACTION LOG ({commands.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            TTS Audio Synthesizer: Active
          </span>
        </div>

        {commands.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs font-mono">
            No voice interactions recorded yet. Press the mic button or click any command above.
          </div>
        ) : (
          <div className="space-y-3">
            {commands.map((cmd) => (
              <div
                key={cmd.id}
                className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/70">
                      {cmd.detectedIntent}
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      {cmd.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="font-semibold text-white">"{cmd.rawQuery}"</div>
                  <div className="text-neutral-300 text-xs flex items-center gap-1.5 text-cyan-200/90">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{cmd.spokenResponse}</span>
                  </div>
                </div>

                <button
                  onClick={() => speechService.speak(cmd.spokenResponse)}
                  title="Replay TTS audio in helmet"
                  className="self-end sm:self-center px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-[11px] font-mono flex items-center gap-1 transition"
                >
                  <Volume2 className="w-3 h-3 text-cyan-400" />
                  <span>REPLAY AUDIO</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
