# 666 SOUNDS — Psytrance Prompt Engine

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

---

## Projekt: 666 SOUNDS DESIGN

```
GitHub: xfraggelpower666x/666-sounds-psytrance-engine
DAW:    xfraggelpower666x/stabledaw-Fraggel → gantasmo/theDAW
```

---

*Built with ⛧ by 666 SOUNDS DESIGN · Dortmund, NRW*
