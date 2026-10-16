import React, { useState } from 'react';
import { Mic, Volume2, Trash2, Calendar, MapPin, Gauge, Plus, FileText, Check } from 'lucide-react';
import { VoiceMemo, RideTelemetry } from '../types';
import { speechService } from '../services/speechService';
import { audioEffects } from '../services/audioEffects';

interface TripMemosProps {
  memos: VoiceMemo[];
  setMemos: React.Dispatch<React.SetStateAction<VoiceMemo[]>>;
  telemetry: RideTelemetry;
}

export const TripMemos: React.FC<TripMemosProps> = ({
  memos,
  setMemos,
  telemetry,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [memoText, setMemoText] = useState('');

  const handleStartRecording = () => {
    setIsRecording(true);
    audioEffects.playAssistantListen();
    speechService.startListening();

    speechService.setCallbacks(
      (cmd) => {
        setIsRecording(false);
        const newMemo: VoiceMemo = {
          id: 'memo-' + Date.now(),
          timestamp: new Date(),
          transcript: cmd.rawQuery,
          durationSec: 4,
          speedAtRecording: Math.round(telemetry.currentSpeed),
          locationTag: 'Pacific Coast Hwy Mile 18',
        };
        setMemos(prev => [newMemo, ...prev]);
        audioEffects.playRogerBeep();
      },
      (text) => {
        setMemoText(text);
      }
    );
  };

  const handleStopRecording = () => {
    speechService.stopListening();
    setIsRecording(false);
    if (memoText.trim()) {
      const newMemo: VoiceMemo = {
        id: 'memo-' + Date.now(),
        timestamp: new Date(),
        transcript: memoText.trim(),
        durationSec: 5,
        speedAtRecording: Math.round(telemetry.currentSpeed),
        locationTag: 'Pacific Coast Hwy Mile 18',
      };
      setMemos(prev => [newMemo, ...prev]);
      setMemoText('');
      audioEffects.playRogerBeep();
    }
  };

  const handleAddManualMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoText.trim()) return;

    const newMemo: VoiceMemo = {
      id: 'memo-' + Date.now(),
      timestamp: new Date(),
      transcript: memoText.trim(),
      durationSec: 6,
      speedAtRecording: Math.round(telemetry.currentSpeed),
      locationTag: 'Route GPS Point',
    };
    setMemos(prev => [newMemo, ...prev]);
    setMemoText('');
    audioEffects.playRogerBeep();
  };

  const handleDeleteMemo = (id: string) => {
    setMemos(prev => prev.filter(m => m.id !== id));
  };

  const handlePlayMemo = (memo: VoiceMemo) => {
    audioEffects.playAssistantListen();
    speechService.speak(memo.transcript);
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-display font-bold text-white tracking-wide">
                HANDS-FREE RIDE VOICE MEMOS
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Dictate audio notes while riding without taking hands off handlebars.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-lg ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-950/40'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isRecording ? 'STOP & SAVE MEMO' : 'RECORD VOICE MEMO'}</span>
            </button>
          </div>
        </div>

        {/* Interim Recording Indicator */}
        {isRecording && (
          <div className="mt-4 p-3 bg-neutral-950 border border-rose-500/50 rounded-xl flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <div className="flex-1 text-xs text-white font-mono">
              {memoText ? `"${memoText}"` : 'Recording audio... Speak memo now.'}
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              {Math.round(telemetry.currentSpeed)} KM/H
            </span>
          </div>
        )}

        {/* Text Input Fallback */}
        <form onSubmit={handleAddManualMemo} className="mt-4 flex gap-2">
          <input
            type="text"
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            placeholder="Type a ride note (e.g., 'Check chain tension after ride', 'Scenic overlook at cliff')..."
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>SAVE</span>
          </button>
        </form>
      </div>

      {/* Memo List Cards */}
      <div className="space-y-3">
        {memos.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center text-neutral-500 text-xs font-mono">
            No voice ride memos captured yet. Click "Record Voice Memo" or type a memo above.
          </div>
        ) : (
          memos.map((memo) => (
            <div
              key={memo.id}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-500" />
                    <span>{memo.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <MapPin className="w-3 h-3" />
                    <span>{memo.locationTag}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Gauge className="w-3 h-3" />
                    <span>{memo.speedAtRecording} km/h</span>
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">
                  "{memo.transcript}"
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handlePlayMemo(memo)}
                  title="Play Voice Audio in Helmet"
                  className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-cyan-400 flex items-center gap-1.5 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>PLAY VOICE</span>
                </button>
                <button
                  onClick={() => handleDeleteMemo(memo.id)}
                  title="Delete Memo"
                  className="p-2 rounded-lg bg-neutral-950 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
