/**
 * PsyPromptPanel.tsx
 * 666 SOUNDS DESIGN — Psychoacoustic Psytrance Prompt Builder
 *
 * Integrates into theDAW (stabledaw-Fraggel / gantasmo/theDAW) as a
 * drop-in companion for SunoGenPanel — Custom Mode slot.
 *
 * Usage (in SunoModeFields.tsx or SunoGenPanel.tsx, Custom Mode block):
 *   import { PsyPromptPanel } from './PsyPromptPanel';
 *   // Add inside the Custom mode JSX, before or after <StyleInput />:
 *   <PsyPromptPanel />
 *
 * What it does:
 *   - Lets the user pick Subgenre, BPM, Sonic Elements, Mood, Scale
 *   - Builds a 200-char optimised Suno Style tag
 *   - One-click "Inject" writes it directly to useSunoStore → style field
 *   - Compact accordion UI that fits inside theDAW's compose card
 *
 * Stack: React 19 + TypeScript + Tailwind 4 + Zustand 5 (from theDAW)
 * Dependencies: only react, lucide-react, useSunoStore (already in theDAW)
 *
 * @author 666 SOUNDS DESIGN — xfraggelpower666x
 */

import React, { useCallback, useMemo, useReducer, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Dices,
  Zap,
  Copy,
  Brain,
  Music2,
  Waves,
  Layers3,
} from 'lucide-react';
import { useSunoStore } from './sunoStore';

// ─────────────────────────────────────────────────────────────
// DATA DEFINITIONS
// ─────────────────────────────────────────────────────────────

interface Subgenre {
  id: string;
  label: string;
  bpmRange: [number, number];
  color: string;
  coreTags: string[];
}

const SUBGENRES: Subgenre[] = [
  { id: 'dark',        label: 'Dark Psy',    bpmRange: [148, 155], color: '#c92fff', coreTags: ['ominous atmosphere', 'distorted acid bassline with sidechain compression', 'dark ritual energy', 'glitch percussion'] },
  { id: 'forest',      label: 'Forest',      bpmRange: [148, 155], color: '#00ff9d', coreTags: ['organic textures', 'twisted distorted bassline', 'shamanic percussion FX', 'tribal ritual energy'] },
  { id: 'full-on',     label: 'Full-On',     bpmRange: [143, 147], color: '#ff2d78', coreTags: ['euphoric leads', 'punchy kick', 'pumping distorted bassline', 'twisting arp leads'] },
  { id: 'progressive', label: 'Progressive', bpmRange: [138, 143], color: '#00e5ff', coreTags: ['deep hypnotic groove', 'rolling bassline', 'layered evolving pads', 'subtle tension'] },
  { id: 'goa',         label: 'Goa',         bpmRange: [140, 148], color: '#ffe000', coreTags: ['melodic spirals', 'cosmic leads', 'classic acid bassline', 'goa sunrise energy'] },
  { id: 'hi-tech',     label: 'Hi-Tech',     bpmRange: [155, 165], color: '#ff7a00', coreTags: ['extreme tempo', 'industrial kick', 'hyper-complex cyber patterns', 'mechanical precision bassline'] },
  { id: 'suomi',       label: 'Suomi',       bpmRange: [148, 155], color: '#ff2d78', coreTags: ['aggressive rolling mid-bass', 'scandinavian darkness', 'raw underground energy'] },
  { id: 'zenonesque',  label: 'Zenonesque',  bpmRange: [138, 143], color: '#c92fff', coreTags: ['deep meditative layers', 'minimal hypnotic groove', 'cosmic depth', 'inner journey'] },
];

interface SonicElement {
  id: string;
  label: string;
  tag: string;
}

const SONIC_ELEMENTS: SonicElement[] = [
  { id: 'acid',      label: 'Acid 303',    tag: 'acid bassline 303 filter sweep' },
  { id: 'sidechain', label: 'Sidechain',   tag: 'heavy sidechain compression' },
  { id: 'cosmic',    label: 'Cosmic FX',   tag: 'cosmic reverb FX tail' },
  { id: 'glitch',    label: 'Glitch',      tag: 'glitch percussion stutter' },
  { id: 'tribal',    label: 'Tribal',      tag: 'tribal percussion loop' },
  { id: 'arp',       label: 'Arp Lead',    tag: 'twisting arp lead sequence' },
  { id: 'drone',     label: 'Drone',       tag: 'dark drone pad layer' },
  { id: 'stab',      label: 'Stabs',       tag: 'sharp synth stabs' },
  { id: '808',       label: '808 Sub',     tag: 'deep 808 sub bass' },
  { id: 'offbeat',   label: 'Offbeat',     tag: 'offbeat bass stabs' },
  { id: 'vocoder',   label: 'Vocoder',     tag: 'robotic vocoder voice' },
  { id: 'riser',     label: 'Riser',       tag: 'tension riser FX build' },
];

interface Mood {
  id: string;
  label: string;
  tag: string;
}

const MOODS: Mood[] = [
  { id: 'euphoric',   label: 'Euphoric',   tag: 'euphoric' },
  { id: 'dark',       label: 'Dark',       tag: 'dark' },
  { id: 'mystical',   label: 'Mystical',   tag: 'mystical' },
  { id: 'hypnotic',   label: 'Hypnotic',   tag: 'hypnotic' },
  { id: 'aggressive', label: 'Aggressive', tag: 'aggressive' },
  { id: 'cosmic',     label: 'Cosmic',     tag: 'cosmic' },
  { id: 'spiritual',  label: 'Spiritual',  tag: 'spiritual' },
  { id: 'ominous',    label: 'Ominous',    tag: 'ominous' },
];

const SCALES = ['Phrygian', 'Dorian', 'Harmonic Minor', 'Double Harmonic', 'Lydian', 'Locrian'];

// Guard rules: these mood/element combos conflict → auto-fix on randomize
const GUARD_PAIRS: Array<[string, string]> = [
  ['euphoric', 'ominous'],
  ['euphoric', 'dark'],
];

// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────

interface PsyState {
  subgenreId: string;
  bpm: number;
  sonic: Set<string>;
  moods: Set<string>;
  scale: string;
}

type PsyAction =
  | { type: 'SET_SUBGENRE'; id: string }
  | { type: 'SET_BPM'; bpm: number }
  | { type: 'TOGGLE_SONIC'; id: string }
  | { type: 'TOGGLE_MOOD'; id: string }
  | { type: 'SET_SCALE'; scale: string }
  | { type: 'RANDOMIZE' }
  | { type: 'LOAD_PRESET'; preset: PsyState };

function getDefaultBpm(id: string): number {
  const sg = SUBGENRES.find(s => s.id === id);
  if (!sg) return 148;
  return Math.round((sg.bpmRange[0] + sg.bpmRange[1]) / 2);
}

function psyReducer(state: PsyState, action: PsyAction): PsyState {
  switch (action.type) {
    case 'SET_SUBGENRE':
      return { ...state, subgenreId: action.id, bpm: getDefaultBpm(action.id) };
    case 'SET_BPM':
      return { ...state, bpm: action.bpm };
    case 'TOGGLE_SONIC': {
      const next = new Set(state.sonic);
      if (next.has(action.id)) next.delete(action.id);
      else if (next.size < 4) next.add(action.id);
      return { ...state, sonic: next };
    }
    case 'TOGGLE_MOOD': {
      const next = new Set(state.moods);
      if (next.has(action.id)) next.delete(action.id);
      else if (next.size < 2) next.add(action.id);
      return { ...state, moods: next };
    }
    case 'SET_SCALE':
      return { ...state, scale: action.scale };
    case 'RANDOMIZE': {
      const sg = SUBGENRES[Math.floor(Math.random() * SUBGENRES.length)];
      const bpm = sg.bpmRange[0] + Math.floor(Math.random() * (sg.bpmRange[1] - sg.bpmRange[0] + 1));
      const sonicPool = [...SONIC_ELEMENTS].sort(() => Math.random() - 0.5).slice(0, 3);
      const moodPool  = [...MOODS].sort(() => Math.random() - 0.5).slice(0, 2);
      // Guard fix
      const sonic = new Set(sonicPool.map(s => s.id));
      const moods = new Set(moodPool.map(m => m.id));
      GUARD_PAIRS.forEach(([a, b]) => { if (moods.has(a) && moods.has(b)) moods.delete(b); });
      const scale = SCALES[Math.floor(Math.random() * SCALES.length)];
      return { subgenreId: sg.id, bpm, sonic, moods, scale };
    }
    case 'LOAD_PRESET':
      return {
        ...action.preset,
        sonic: new Set(action.preset.sonic),
        moods: new Set(action.preset.moods),
      };
    default:
      return state;
  }
}

function initialState(): PsyState {
  return {
    subgenreId: 'dark',
    bpm: 150,
    sonic: new Set(['acid', 'sidechain']),
    moods: new Set(['dark', 'hypnotic']),
    scale: 'Phrygian',
  };
}

// ─────────────────────────────────────────────────────────────
// PROMPT BUILDER (200-char enforced)
// ─────────────────────────────────────────────────────────────

function buildPrompt(state: PsyState): string {
  const sg = SUBGENRES.find(s => s.id === state.subgenreId) ?? SUBGENRES[0];
  const sonicTags = SONIC_ELEMENTS.filter(s => state.sonic.has(s.id)).map(s => s.tag);
  const moodTags  = MOODS.filter(m => state.moods.has(m.id)).map(m => m.tag);

  const parts = [
    `${sg.label} psytrance`,
    `${state.bpm} BPM`,
    ...sg.coreTags.slice(0, 2),
    ...sonicTags,
    ...moodTags,
    state.scale !== 'Phrygian' ? `${state.scale} scale` : '',
  ].filter(Boolean);

  let prompt = parts.join(', ');
  if (prompt.length > 200) {
    prompt = prompt.substring(0, 200);
    const lastComma = prompt.lastIndexOf(',');
    if (lastComma > 150) prompt = prompt.substring(0, lastComma);
  }
  return prompt;
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

/** Tiny chip button — reused for subgenre / sonic / mood */
const Chip: React.FC<{
  label: string;
  active: boolean;
  disabled?: boolean;
  color?: string;
  onClick: () => void;
}> = ({ label, active, disabled, color, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    style={active && color ? { borderColor: color, color, background: `${color}18` } : undefined}
    className={[
      'px-2 py-1 rounded-md border text-[9px] font-mono font-bold uppercase tracking-wider transition-all',
      'focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-400',
      active && !color
        ? 'border-purple-400 bg-purple-500/15 text-purple-200'
        : !active
        ? 'border-white/8 bg-white/2 text-zinc-500 hover:border-white/20 hover:text-zinc-300'
        : '',
      disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
    ].join(' ')}
  >
    {label}
  </button>
);

/** Collapsible section header */
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  label: string;
  open: boolean;
  onToggle: () => void;
  badge?: string;
}> = ({ icon, label, open, onToggle, badge }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center gap-1.5 py-1.5 text-left hover:text-zinc-200 transition-colors group"
  >
    <span className="text-purple-400 group-hover:text-purple-300">{icon}</span>
    <span className="mono-label text-[9px]! flex-1">{label}</span>
    {badge && (
      <span className="text-[8px] font-mono text-zinc-500 mr-1">{badge}</span>
    )}
    {open
      ? <ChevronUp className="w-3 h-3 text-zinc-600" />
      : <ChevronDown className="w-3 h-3 text-zinc-600" />}
  </button>
);

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

/**
 * PsyPromptPanel — drop this anywhere inside theDAW's Custom Mode block.
 * It renders as a compact, collapsible card that auto-fills the Suno style field.
 */
export const PsyPromptPanel: React.FC = () => {
  const patch = useSunoStore(s => s.patch);

  const [psyState, dispatch] = useReducer(psyReducer, undefined, initialState);
  const [expanded, setExpanded] = useState(true);
  const [openSection, setOpenSection] = useState<'subgenre' | 'sonic' | 'mood' | null>('subgenre');
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => buildPrompt(psyState), [psyState]);
  const charColor =
    prompt.length > 200 ? 'text-red-400' :
    prompt.length > 185 ? 'text-amber-400' :
    'text-emerald-400';

  const currentSg = SUBGENRES.find(s => s.id === psyState.subgenreId) ?? SUBGENRES[0];

  /** Write prompt into Suno store → style field */
  const handleInject = useCallback(() => {
    patch({ style: prompt, mode: 'custom' });
  }, [patch, prompt]);

  /** Copy to clipboard */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback
    }
  }, [prompt]);

  const toggleSection = (s: typeof openSection) =>
    setOpenSection(prev => prev === s ? null : s);

  return (
    <div className="rounded-lg border border-purple-500/20 bg-[#0c0a14]/80 overflow-hidden">

      {/* ── Header ── */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 border-b border-white/5 hover:bg-white/3 transition-colors"
      >
        <span className="grid place-items-center w-5 h-5 rounded bg-purple-500/15 border border-purple-500/30">
          <Brain className="w-3 h-3 text-purple-300" />
        </span>
        <span className="flex-1 text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-200">
            666 Psy Engine
          </span>
          <span className="ml-2 text-[8px] font-mono text-zinc-600">
            Psychoacoustic Prompt Builder
          </span>
        </span>
        {/* live char badge */}
        <span className={`text-[8px] font-mono ${charColor} mr-1`}>
          {prompt.length}/200
        </span>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-zinc-600 shrink-0" />}
      </button>

      {expanded && (
        <div className="px-3 pt-2 pb-3 flex flex-col gap-2">

          {/* ── Subgenre ── */}
          <div>
            <SectionHeader
              icon={<Music2 className="w-3 h-3" />}
              label="Subgenre"
              open={openSection === 'subgenre'}
              onToggle={() => toggleSection('subgenre')}
              badge={currentSg.label}
            />
            {openSection === 'subgenre' && (
              <div className="flex flex-wrap gap-1 pt-1 pb-0.5">
                {SUBGENRES.map(sg => (
                  <Chip
                    key={sg.id}
                    label={sg.label}
                    active={psyState.subgenreId === sg.id}
                    color={sg.color}
                    onClick={() => dispatch({ type: 'SET_SUBGENRE', id: sg.id })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── BPM ── */}
          <div className="flex items-center gap-2">
            <span className="mono-label text-[9px]! shrink-0">BPM</span>
            <input
              type="range"
              min={130}
              max={170}
              step={1}
              value={psyState.bpm}
              onChange={e => dispatch({ type: 'SET_BPM', bpm: parseInt(e.target.value) })}
              className="flex-1 h-1 accent-purple-500 cursor-pointer"
            />
            <span className="text-[10px] font-mono text-sky-300 w-8 text-right shrink-0">
              {psyState.bpm}
            </span>
          </div>

          {/* ── Sonic Elements ── */}
          <div>
            <SectionHeader
              icon={<Waves className="w-3 h-3" />}
              label="Sonic Elements"
              open={openSection === 'sonic'}
              onToggle={() => toggleSection('sonic')}
              badge={`${psyState.sonic.size}/4`}
            />
            {openSection === 'sonic' && (
              <div className="flex flex-wrap gap-1 pt-1 pb-0.5">
                {SONIC_ELEMENTS.map(s => (
                  <Chip
                    key={s.id}
                    label={s.label}
                    active={psyState.sonic.has(s.id)}
                    disabled={!psyState.sonic.has(s.id) && psyState.sonic.size >= 4}
                    onClick={() => dispatch({ type: 'TOGGLE_SONIC', id: s.id })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Mood ── */}
          <div>
            <SectionHeader
              icon={<Layers3 className="w-3 h-3" />}
              label="Mood"
              open={openSection === 'mood'}
              onToggle={() => toggleSection('mood')}
              badge={`${psyState.moods.size}/2`}
            />
            {openSection === 'mood' && (
              <div className="flex flex-wrap gap-1 pt-1 pb-0.5">
                {MOODS.map(m => (
                  <Chip
                    key={m.id}
                    label={m.label}
                    active={psyState.moods.has(m.id)}
                    disabled={!psyState.moods.has(m.id) && psyState.moods.size >= 2}
                    onClick={() => dispatch({ type: 'TOGGLE_MOOD', id: m.id })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Scale ── */}
          <div className="flex items-center gap-2">
            <span className="mono-label text-[9px]! shrink-0">Scale</span>
            <select
              value={psyState.scale}
              onChange={e => dispatch({ type: 'SET_SCALE', scale: e.target.value })}
              className="compact-input flex-1 text-[9px]!"
            >
              {SCALES.map(sc => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>

          {/* ── Prompt preview ── */}
          <div className="rounded-md border border-white/8 bg-black/30 px-2 py-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] font-mono uppercase tracking-widest text-purple-400/70">
                Style Tag Preview
              </span>
              <span className={`text-[8px] font-mono ${charColor}`}>
                {prompt.length}/200
              </span>
            </div>
            <p className="text-[9px] font-mono text-amber-200/90 leading-relaxed break-all">
              {prompt || '—'}
            </p>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-1.5 flex-wrap">
            {/* Inject → writes directly to Suno style field */}
            <button
              type="button"
              onClick={handleInject}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md
                font-black uppercase tracking-widest text-[9px] text-white
                bg-purple-600 hover:bg-purple-500 transition-colors
                shadow-[0_4px_14px_-6px_rgba(168,85,247,0.8)]"
            >
              <Zap className="w-3 h-3 fill-current" />
              Inject Style
            </button>

            {/* Copy */}
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-white/10
                bg-white/3 hover:bg-white/8 text-zinc-400 hover:text-zinc-200
                text-[9px] font-mono transition-colors"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied!' : 'Copy'}
            </button>

            {/* Randomize */}
            <button
              type="button"
              onClick={() => dispatch({ type: 'RANDOMIZE' })}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-white/10
                bg-white/3 hover:bg-white/8 text-zinc-400 hover:text-zinc-200
                text-[9px] font-mono transition-colors"
            >
              <Dices className="w-3 h-3" />
              Random
            </button>
          </div>

          {/* ── Tip ── */}
          <p className="text-[8px] font-mono text-zinc-600 leading-tight">
            💡 <span className="text-zinc-500">Inject</span> writes this tag directly into the Style field above.
            Switch to <span className="text-zinc-500">Custom Mode</span> in Suno to use it.
          </p>

        </div>
      )}
    </div>
  );
};

export default PsyPromptPanel;
