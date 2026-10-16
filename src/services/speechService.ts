import { VoiceCommandRecord } from '../types';
import { audioEffects } from './audioEffects';

// Type definitions for SpeechRecognition
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal?: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

class HelmetSpeechService {
  private recognition: SpeechRecognitionLike | null = null;
  private isListening: boolean = false;
  private onCommandCallback: ((cmd: VoiceCommandRecord) => void) | null = null;
  private onTranscriptUpdate: ((text: string, isFinal: boolean) => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    }).SpeechRecognition || (window as unknown as {
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    }).webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          audioEffects.playAssistantListen();
        };

        this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
          const results = event.results;
          if (results.length > 0) {
            const first = results[0];
            const transcript = first[0]?.transcript || '';
            const isFinal = Boolean(first.isFinal);

            if (this.onTranscriptUpdate) {
              this.onTranscriptUpdate(transcript, isFinal);
            }

            if (isFinal && transcript.trim()) {
              this.processVoiceCommand(transcript.trim());
            }
          }
        };

        this.recognition.onerror = () => {
          this.isListening = false;
        };

        this.recognition.onend = () => {
          this.isListening = false;
        };
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    }
  }

  public isAvailable(): boolean {
    return this.recognition !== null;
  }

  public setCallbacks(
    onCommand: (cmd: VoiceCommandRecord) => void,
    onTranscript?: (text: string, isFinal: boolean) => void
  ) {
    this.onCommandCallback = onCommand;
    if (onTranscript) this.onTranscriptUpdate = onTranscript;
  }

  public startListening() {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch {
        // already started or busy
      }
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05; // Slightly brisk for riding efficiency
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Pick a clean English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  // Parse command intent
  public processVoiceCommand(raw: string, currentSpeedKmh: number = 74): VoiceCommandRecord {
    const q = raw.toLowerCase();
    let intent: VoiceCommandRecord['detectedIntent'] = 'unknown';
    let responseText = '';
    let status: VoiceCommandRecord['status'] = 'executed';

    if (q.includes('speed') || q.includes('how fast')) {
      intent = 'speed';
      responseText = `Current speed is ${Math.round(currentSpeedKmh)} kilometers per hour. Speed limit here is 80.`;
    } else if (q.includes('gas') || q.includes('fuel') || q.includes('petrol')) {
      intent = 'nav';
      responseText = `Nearest Shell gas station is 3.2 kilometers ahead on Route 9. Estimated 4 minutes.`;
    } else if (q.includes('weather') || q.includes('rain') || q.includes('temperature')) {
      intent = 'weather';
      responseText = `Partly cloudy, 23° Celsius. Wind 14 km/h from the West. No precipitation expected for 2 hours.`;
    } else if (q.includes('pothole') || q.includes('hazard') || q.includes('police') || q.includes('debris') || q.includes('accident')) {
      intent = 'hazard';
      const type = q.includes('police') ? 'Police radar' : q.includes('debris') ? 'Road debris' : 'Road hazard';
      responseText = `Broadcasting hazard alert to squad: ${type} logged at current GPS coordinates.`;
      status = 'warning';
      audioEffects.playHazardAlert();
    } else if (q.includes('channel') || q.includes('intercom') || q.includes('mute') || q.includes('talk')) {
      intent = 'intercom';
      if (q.includes('mute')) {
        responseText = `Intercom microphone muted. Press PTT or double-tap helmet to unmute.`;
      } else {
        responseText = `Intercom channel active with 4 squad members online. Latency 18 milliseconds.`;
      }
    } else if (q.includes('sos') || q.includes('help') || q.includes('emergency') || q.includes('crash')) {
      intent = 'emergency';
      responseText = `Emergency distress protocol initiated! Alerting squad and dispatching coordinates in 10 seconds.`;
      status = 'alert';
      audioEffects.playSosBeep();
    } else if (q.includes('music') || q.includes('song') || q.includes('volume') || q.includes('play') || q.includes('pause')) {
      intent = 'music';
      responseText = `Helmet audio volume set to 75%. Helmet intercom ducking enabled.`;
    } else {
      intent = 'unknown';
      responseText = `Received command: "${raw}". Say "Speed", "Nearest Fuel", "Report Hazard", or "Squad status".`;
    }

    const record: VoiceCommandRecord = {
      id: 'cmd-' + Date.now(),
      timestamp: new Date(),
      rawQuery: raw,
      detectedIntent: intent,
      spokenResponse: responseText,
      status,
    };

    if (this.onCommandCallback) {
      this.onCommandCallback(record);
    }

    this.speak(responseText);
    return record;
  }
}

export const speechService = new HelmetSpeechService();
