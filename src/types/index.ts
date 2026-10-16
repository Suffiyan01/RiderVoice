export interface Rider {
  id: string;
  name: string;
  callsign: string;
  bikeModel: string;
  avatarColor: string;
  isOnline: boolean;
  isTalking: boolean;
  batteryLevel: number;
  distanceMeters: number;
  bearingDeg: number;
  signalStrength: number; // 1-5
  lastSpoke?: string;
}

export interface IntercomChannel {
  id: string;
  name: string;
  frequency: string; // e.g. "462.5625 MHz" or "Ch 04"
  description: string;
  activeMembers: number;
  isEncrypted: boolean;
  isEmergency?: boolean;
}

export interface HazardAlert {
  id: string;
  type: 'pothole' | 'police' | 'debris' | 'accident' | 'heavy_rain' | 'fuel';
  title: string;
  reportedBy: string;
  distanceMeters: number;
  bearingDeg: number;
  timestamp: Date;
  votes: number;
}

export interface VoiceCommandRecord {
  id: string;
  timestamp: Date;
  rawQuery: string;
  detectedIntent: 'speed' | 'nav' | 'hazard' | 'intercom' | 'weather' | 'emergency' | 'music' | 'unknown';
  spokenResponse: string;
  status: 'executed' | 'warning' | 'alert';
}

export interface HelmetAudioConfig {
  voxSensitivity: number; // 1 to 10 (higher = triggers with softer voice)
  isVoxActive: boolean;
  noiseSuppression: 'off' | 'adaptive' | 'aggressive';
  intercomVolume: number;
  navVolume: number;
  musicVolume: number;
  autoDuckMusic: boolean;
  connectedDevice: string;
  batteryPercentage: number;
  isConnected: boolean;
  lowLatencyMode: boolean;
}

export interface RideTelemetry {
  currentSpeed: number; // km/h
  topSpeed: number;
  avgSpeed: number;
  distanceKm: number;
  elevationMeters: number;
  headingDeg: number;
  rideDurationSec: number;
  isRiding: boolean;
  leanAngleDeg: number;
}

export interface VoiceMemo {
  id: string;
  timestamp: Date;
  transcript: string;
  durationSec: number;
  speedAtRecording: number;
  locationTag: string;
}
