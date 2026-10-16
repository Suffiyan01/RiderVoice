import React, { useState, useEffect } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, CheckCircle2, MapPin, Radio } from 'lucide-react';
import { audioEffects } from '../services/audioEffects';

interface SosModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirmDispatch: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onCancel,
  onConfirmDispatch,
}) => {
  const [countdown, setCountdown] = useState(10);
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      setDispatched(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setDispatched(true);
          onConfirmDispatch();
          return 0;
        }
        audioEffects.playSosBeep();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onConfirmDispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-rose-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-950 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(244,63,94,0.6)] space-y-6">
        
        {/* Pulsing Alarm Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-rose-600/20 animate-ping absolute" />
          <div className="w-20 h-20 rounded-full bg-rose-600 border-2 border-rose-400 flex items-center justify-center text-white shadow-xl">
            <AlertTriangle className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-wider">
            {dispatched ? 'EMERGENCY DISTRESS BROADCASTED' : 'CRASH / DISTRESS DETECTED'}
          </h2>
          <p className="text-xs sm:text-sm text-rose-200 mt-2">
            {dispatched
              ? 'Distress coordinates sent to Squad Intercom Emergency Ch 09 and emergency services.'
              : 'Broadcasting live distress beacon to all squad channels and SMS contacts.'}
          </p>
        </div>

        {/* Big Countdown Number */}
        {!dispatched && (
          <div className="bg-rose-950/60 border border-rose-500/40 rounded-2xl py-4">
            <div className="text-6xl font-display font-black text-rose-400 animate-pulse">
              00:{countdown.toString().padStart(2, '0')}
            </div>
            <div className="text-[11px] font-mono text-rose-300 mt-1 uppercase tracking-widest">
              SECONDS UNTIL EMERGENCY DISPATCH
            </div>
          </div>
        )}

        {/* GPS Coordinates readout */}
        <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-rose-400">
            <MapPin className="w-4 h-4" />
            <span>GPS COORDS:</span>
          </div>
          <span className="font-bold text-white">36.5684° N, 121.9542° W</span>
        </div>

        {/* Buttons: Cancel vs Instant Dispatch */}
        <div className="space-y-3 pt-2">
          {!dispatched ? (
            <>
              <button
                onClick={onCancel}
                className="w-full py-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-display font-bold text-lg tracking-wider border border-neutral-600 active:scale-95 transition"
              >
                I AM OK — CANCEL SOS
              </button>
              <button
                onClick={() => {
                  setCountdown(0);
                  setDispatched(true);
                  onConfirmDispatch();
                }}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>SEND DISTRESS NOW (SKIP COUNTDOWN)</span>
              </button>
            </>
          ) : (
            <button
              onClick={onCancel}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>DISMISS ALARM & RETURN</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
