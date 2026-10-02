# LYVRA PSY ENGINE

> Psychoacoustic Psytrance Prompt Generator für Suno AI Custom Mode  
> Cyberpunk Neon / UV Glow Design · iPhone PWA · Browser DAW Integration

---

## Features

### ⚡ Core Generator
- **8 Subgenres**: Full-On, Dark Psy, Forest, Progressive, Goa, Hi-Tech, Suomi, Zenonesque
- **BPM**: 130–170 (Subgenre-optimierte Defaults)
- **16 Sonic Elements** (max 4 gleichzeitig)
- **16 Moods** (max 2)
- **8 Scales** (Phrygian, Dorian, etc.)
- **8 Mix Traits**
- **Randomize** mit Guard Auto-Fix
- **200-char optimierter Suno Style Tag**

### 🎨 Visual Output
- Auto-generierter Visual Prompt aus Subgenre + Mood
- **Midjourney** / **Flux** / **Stable Diffusion** Format-Switcher

### 📝 Lyric Structure
- Suno Section-Tags (`[Intro]`, `[Build]`, `[Drop]`, etc.)
- Subgenre-angepasste Struktur (Dark, Forest, Goa, Progressive, Hi-Tech, Default)

### 🧠 Psychoakustik Engine
| Profil | Hz | Band | Effekt |
|--------|-----|------|--------|
| Trance | 6 Hz | Theta | Flow-State |
| Flow | 10 Hz | Alpha | Relaxed Focus |
| Hypnose | 3.5 Hz | Delta | Tiefhypnose |
| Ekstase | 40 Hz | Gamma | Peak Experience |
| Meditation | 5 Hz | Theta | Deep Meditation |
| Ritual | 7.83 Hz | Schumann | Erdresonanz |

- **Binaural Beats**: Carrier 100–400 Hz, L/R Frequenz-Kalkulator
- **Haas Effect**: 1–35ms, Zone-Klassifikation (Fusion/Presence/Width/Pre-Echo)
- **Isochronic Pulses**: Period/Pulse-ON/BPM-Äquivalent live berechnet
- **Room Acoustics**: Tight Studio (0.3s) / Club (0.8s) / Cave (2.5s) / Cosmic Void (8s)
- **Animated Canvas Visualizer**: L/R Waveforms + Isochronic Overlay

### 🌐 4D Akustik Engine
- **XY-Pad**: Azimuth -180°/+180°, Elevation -90°/+90° (Touch/Drag)
- **Z-Achse**: Distance 0.1–20m
- **8 Motion Paths**: Static, Orbit, Spiral, Pendulum, Lissajous, Ascent, Vortex, Quantum
- **Ambisonics**: Stereo / FOA (4ch) / SOA (9ch) / TOA (16ch)
- **Spatial Kalkulator**: ILD, ITD, Air Absorption, Doppler Pitch-Shift (live)
- **B-Format Koeffizienten**: W, X, Y, Z live berechnet
- **6 Presets**: Orbit Bass, Cosmic Lead, Vortex Drop, Pendulum Pad, Quantum FX, Spiral Rise
- **3D Canvas Visualizer**: Motion Trail, HOA Rings, Position Display

### ⚙️ Modular Matrix
- **3 Slots**: Core / Psycho / 4D — unabhängig aktivierbar
- **Tag Compressor**: 60+ Long→Short Substitutionen + semantische Dedup
- **Kompatibilitäts-Matrix**: Subgenre+Profil+Motion Synergy/Conflict Detection
- **Master Prompt**: Alle aktiven Layer → 200-char merged String
- **Matrix Presets**: Save/Load komplette 3-Layer Snapshots

### 🎛️ Production Engine
- Gemeinsame Core-Prompt-Basis für Produktions-, Quellen-, Studio- und FX-Briefs
- **v6 / Wild / Mini Brief-Profile** mit Weirdness-, Influence- und Diversity-Steuerung (Prompt-Text, keine API-Anbindung)
- Multi-Source Briefs mit musikalischer Rolle, zu erhaltenden und zu transformierenden Eigenschaften
- Hard Anchors für Genre, Tempo, Groove, Tonalität und Mix; Wild-Mutationen und Konfliktwarnungen
- Studio-2-Ziele, sechs Custom-FX-Vorlagen und Snapshot-JSON
- HAAS SENTINEL design briefs with protected mono kick/sub, correlation-aware width automation, tempo-synced motion, source starting points, bar-by-bar build/drop automation, and the Dark Forest Safe Width preset
- Haas-aware processing guidance and ordered EQ → distortion → Haas → delay → convolution/reverb → limiter chains
- Psytrance Motor Tools presets for rolling kick/bass design, mono and phase protection, and live conflict warnings
- Intelligent FX Motion System profiles by subgenre and arrangement phase, with bounded family selection and stereo/space/chaos controls
- Semantic causal evidence reports with rule provenance, guard conflicts, snapshots, optional listening ratings and manually entered DAW correlation; confidence is heuristic and no audio is analyzed

> The Production Engine creates prompts and plugin design briefs. It does not process audio or build a real-time VST/AU plugin.

### 🪻 LYVRA Facet Template
- **Track Design**: one shared music intent, motor-first Low/Mid/High roles, semantic lyric causality, meaning-bound emoji guidance, and separate Title / Extended / Style / Lyrics fields with field limits.
- **Suno Studio 2**: generation controls and Studio operation controls are separate; includes the Blueprint's twelve-section ten-minute Extend/arrangement proposal with per-section motor/LOW/MID/HIGH behavior.
- **Speech Design**: simple and advanced modes reflect the observed beta field structure; controlled phoneme candidates require source hash, timecode, original/candidate pronunciation, observation and approval. This is a development candidate, not a released production feature.
- **Six two-phase manual searches**: preaudit and renderer translation for each facet, with separate official and community links. Searches open in a browser; automatic web readback is not implemented.
- **Evidence log and project export**: locally stored manual observations include the source, date, model, Studio mode, claim, interpretation, contradictions, confidence, generalization limit, test candidate and status. Export the evidence or the whole project as JSON/Markdown.
- **WebRadio**: the official mini-player is embedded in the page footer.

> This dashboard is a local, static, rule-based template. It does not access LYVRA's native runtime or repository, write to GitHub, call Suno, analyze audio, or verify renderer behavior. A ten-minute arrangement uses a seed under eight minutes followed by Extend and Studio arrangement; it is not represented as one v6 generation.

### 📊 Audit System
- Score 0–100, Grade A/B/C/D
- Checks: Subgenre, BPM, Zeichenlimit, Mood-Count, Sonic-Elements, Bass-Tag, Guard
- Suno-spezifische Warnings

### 🎼 Orchestra Builder
- Multi-Layer Prompt Builder
- Rollen: Kick/Bass, Leads, Pads, FX/Atmo, Percussion, Stabs, Full Mix
- Pro Layer: eigene Rolle + Subgenre auswählbar

### 🛡️ Guard System
- Konflikt-Erkennung: euphoric+ominous, lo-fi+crisp, hi-tech+meditative, etc.
- Auto-Fix beim Randomize
- Color-coded Status Bar (grün/gelb/rot)

### 💾 Backup / Register
- **Snapshots**: Session-Snapshots (10 max), JSON Export/Import
- **Factory Presets**: 6 (666 Dark Ritual, Deep Forest, Goa Cosmic, Hi-Tech Hell, Prog Deep, Full-On Burst)
- **User Presets**: Save/Load mit Namen

---

## Installation als iPhone PWA

1. Öffne die GitHub Pages URL in **Safari** auf iPhone
2. Tippe auf **Teilen** (Share-Icon) → **Zum Home-Bildschirm**
3. App erscheint als Icon auf dem Home-Screen
4. Funktioniert offline (Service Worker Cache)

---

## theDAW / stabledaw-Fraggel Integration

Das Tool ist als **standalone PWA** konzipiert — Copy-Paste Workflow:

1. Prompt in 666 SOUNDS Engine generieren
2. **Copy Master Prompt** (Matrix-Tab) oder **Copy Prompt** (Core-Tab)
3. In Suno Custom Mode → **Style** Feld einfügen
4. Mit theDAW / stabledaw-Fraggel den generierten Track weiter bearbeiten

### React-Komponente (optional)
Für direkte theDAW-Integration: `PsyPromptPanel.tsx` (coming soon)

---

## Suno Custom Mode — Wichtige Hinweise

| Fakt | Detail |
|------|--------|
| Style-Feld | Max ~200 Zeichen, comma-separated Tags |
| Bass | Explizit beschreiben: "distorted acid bassline with sidechain" statt "psytrance bass" |
| BPM | Angabe hilft dem Modell beim Tempo |
| Instrumental | `[Instrumental]` Tag im Lyrics-Feld |
| Version | v5.5 (Stand Juni 2026) |
| Plan | Pro ($8/mo): ~500 Songs, Commercial Rights |

---

## Tech Stack

- **Pure Vanilla HTML/CSS/JS** — kein Build-Step, kein Framework
- **PWA**: manifest.json + Service Worker (offline-fähig)
- **Canvas API**: Binaural Visualizer + 4D Position Visualizer
- **Fonts**: Orbitron + Share Tech Mono + Inter (Google Fonts)
- **Design**: 666 SOUNDS DESIGN Cyberpunk Neon System

## Entwicklung und Tests

```sh
npm ci
npm test
```

Die Psychoakustik-, 4D- und Production-Tests lassen sich einzeln mit `npm run test:psycho`, `npm run test:4d` und `npm run test:production` ausführen.

---

## Projekt: LYVRA PSY ENGINE

```
GitHub: xfraggelpower666x/666-sounds-psytrance-engine
DAW:    xfraggelpower666x/stabledaw-Fraggel → gantasmo/theDAW
```

---

*Built with ⛧ by 666 SOUNDS DESIGN · Dortmund, NRW*
