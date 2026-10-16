# RiderVoice

Smart hands-free motorcycle rider voice intercom, helmet walkie-talkie, and cockpit voice companion.

## Features

- **Tactical Mesh Intercom**: Multi-channel motorcycle intercom with Push-To-Talk (PTT), VOX (Voice-Activated Transmission) hands-free trigger, live audio visualizer, and tactical radio logs.
- **Cockpit Dashboard HUD**: Sunlight-readable digital speedometer, lean angle horizon indicator, compass heading, elevation, and live GPS telemetry simulation.
- **Hands-Free Voice AI Copilot**: Voice assistant with natural language understanding and speech synthesis audio responses routed directly to helmet speakers.
- **Tactical Squad Radar & Hazards**: Real-time 360° proximity radar tracking for squad riders and community road hazard logging (potholes, speed traps, debris, oil spills).
- **Ride Voice Memos**: Hands-free audio note dictation and playback for capturing route milestones without taking hands off handlebars.
- **Helmet Audio & DSP**: Headset Bluetooth profile selector (Cardo, Sena, FreedConn, Lexin, AirPods), adaptive wind noise filter DSP, and 3-band audio volume mixer (Intercom, Nav, Music).
- **Crash Detection & Emergency SOS**: Instant impact distress alarm with 10-second countdown and automatic coordinate broadcasting.

## Tech Stack & Runtime

- **Runtime**: Node.js 22 (npm)
- **Framework**: React 19 SPA with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Audio & Speech**: Web Audio API synthesizer for radio effects (roger beeps, mic squelch, hazard alerts, SOS pulse) and Web Speech API (SpeechRecognition & SpeechSynthesis)