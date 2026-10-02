'use strict';

const WILD_MUTATION_POOL = [
  'unstable granular resampling',
  'organic insect-like clicks',
  'alien formant vocal fragments',
  'asymmetric 7/16 percussion interruption',
  'reverse-reverb hallucinations',
  'FM metallic screeches',
  'spectral freezing before the drop',
  'modular pitch drift',
  'mutating acid call-and-response',
  'microtonal tension layers'
];

const HAAS_TARGET_GUIDES = [
  { target: 'Kick', use: 'No', start: 'Mono, centered; do not instantiate HAAS SENTINEL.', effect: 'Stable center and clear punch.' },
  { target: 'Subbass below 120 Hz', use: 'No', start: 'Mono, centered; no stereo delay, Haas or side signal.', effect: 'Consistent club-system energy and mono summing.' },
  { target: 'Bass harmonics from about 180-300 Hz', use: 'Yes, restrained', start: 'Keep the sub untouched; widen harmonics only.', effect: 'A larger bass image without detaching the sub.' },
  { target: 'Rolling bass distortion / mid layer', use: 'Yes', start: 'EQ before Haas; wet-path high-pass 180-250 Hz; 8-14 ms.', effect: 'Controlled width while retaining bass definition.' },
  { target: 'Acid / 303 resonance harmonics', use: 'Yes', start: 'Low cut 250-350 Hz (from about 300 Hz); 12-20 ms.', effect: 'Hypnotic rotating presence.' },
  { target: 'Tribal percussion', use: 'Selective', start: '250 Hz low cut; 8-18 ms.', effect: 'Selective spatial motion; preserve transient focus.' },
  { target: 'Creature / insect / glitch FX', use: 'Yes', start: 'Low cut 400-700 Hz (from about 500 Hz); 15-30 ms.', effect: 'Organic forest space and lively periphery.' },
  { target: 'Atmosphere / drone', use: 'Yes', start: '180-300 Hz low cut; 18-35 ms; slow motion.', effect: 'Depth, scale and a three-dimensional field.' },
  { target: 'Riser / downlifter / transition FX', use: 'Yes', start: '500 Hz low cut; 15-40 ms; automate temporarily wider.', effect: 'Build tension and open space before breaks or drops.' }
];

const MOTOR_PRESETS = Object.freeze({
  darkRolling: Object.freeze({
    bassPattern: 'rolling16',
    kickStyle: 'dryPunch',
    kickLengthMs: 90,
    kickClick: 26,
    bassNoteLength: 72,
    bassDrive: 38,
    rubberMovement: 18,
    grooveTightness: 92
  }),
  forestRubber: Object.freeze({
    bassPattern: 'rolling16',
    kickStyle: 'forestKnock',
    kickLengthMs: 105,
    kickClick: 16,
    bassNoteLength: 76,
    bassDrive: 32,
    rubberMovement: 46,
    grooveTightness: 84
  }),
  hitechPressure: Object.freeze({
    bassPattern: 'rolling16',
    kickStyle: 'hitechSnap',
    kickLengthMs: 58,
    kickClick: 58,
    bassNoteLength: 58,
    bassDrive: 55,
    rubberMovement: 12,
    grooveTightness: 98
  }),
  zenoPulse: Object.freeze({
    bassPattern: 'offbeat',
    kickStyle: 'deepThump',
    kickLengthMs: 125,
    kickClick: 14,
    bassNoteLength: 86,
    bassDrive: 28,
    rubberMovement: 30,
    grooveTightness: 78
  })
});

const MOTOR_PATTERNS = Object.freeze({
  rolling16: 'Use an even rolling 1/16 pulse with repeatable note lengths; leave a short, consistent pocket after each kick.',
  offbeat: 'Place bass accents offbeat with deliberate gaps around each kick; avoid an uncontrolled sustained sub tail.',
  triplet: 'Use a measured triplet roll as a phrase-level variation, then return to the straight grid before major kick impacts.',
  broken: 'Use sparse, intentional 1/16 mutations with clear downbeats; keep the kick pattern and phrase accents readable.',
  glide: 'Use restrained glide between selected bass notes; retrigger and phase-align the bass on strong kick beats.'
});

const MOTOR_KICKS = Object.freeze({
  dryPunch: 'Dry Punch: short controlled body, firm transient and minimal sustain.',
  shortClick: 'Short Click / Tight: clipped low tail with a defined high-frequency tick.',
  deepThump: 'Deep Thump: rounded body with a controlled tail; prevent overlap with the next bass note.',
  forestKnock: 'Organic Forest Knock: woody transient over a compact, centered low-frequency body.',
  hitechSnap: 'Hi-Tech Snap: fast transient and very short low tail to leave room for dense bass movement.'
});

const MOTOR_SAFETY_LABELS = Object.freeze({
  kickMono: 'keep the kick mono and centered',
  subMono: 'keep the sub region below 120 Hz mono',
  phaseLock: 'phase-align and retrigger kick/bass at shared downbeats',
  bassSidechain: 'sidechain the bass from the kick with a tempo-appropriate release',
  dryKick: 'preserve a dry, transient-stable kick path',
  lowEndGuard: 'check kick/bass masking and mono compatibility'
});

const MOTOR_SAFETY_DEFAULTS = Object.freeze({
  kickMono: true,
  subMono: true,
  phaseLock: true,
  bassSidechain: true,
  dryKick: true,
  lowEndGuard: true
});

const FX_MOTION_FAMILIES = Object.freeze({
  'Psy FX': {
    role: 'Psychotic movement and perceptual shifts',
    examples: 'acid mutations, formant FX, lasers and frequency shifting'
  },
  'Forest FX': {
    role: 'Organic, lively and dark environments',
    examples: 'insects, branches, creature calls, dark spaces and swarm motion'
  },
  'Full-On FX': {
    role: 'Energetic, bright and direct transitions',
    examples: 'uplifters, reverse cymbals, white-noise sweeps and gated leads'
  },
  'Transition FX': {
    role: 'Connect sections and redirect energy',
    examples: 'reverse reverb, tape stops, filter sweeps, impacts and sub drops'
  },
  'Psycho FX': {
    role: 'Width, depth and spatial illusion',
    examples: 'Haas, mid-side motion, granular clouds and stereo orbit'
  }
});

const FX_MOTION_DEFAULTS = Object.freeze({
  family: 'Forest FX',
  subgenre: 'forest',
  phase: 'groove',
  motion: 'organic',
  energy: 62,
  tension: 56,
  density: 42,
  width: 68,
  chaos: 35,
  space: 58,
  selectedFamilies: Object.freeze(['Acid Mutation', 'Organic Creature FX']),
  safety: Object.freeze({
    protectKick: true,
    protectSub: true,
    highPassFX: true,
    sidechainFX: true,
    monoGuard: true,
    dropMute: false
  })
});

const FX_EFFECT_FAMILIES = Object.freeze([
  'Acid Mutation',
  'Organic Creature FX',
  'Laser Fracture',
  'Reverse Reverb',
  'Granular Dust',
  'Frequency Shift',
  'Noise Riser',
  'Sub Drop',
  'Stereo Orbit',
  'Formant Voice FX',
  'Gate Stutter',
  'Tape Collapse'
]);

const FX_SUBGENRE_PROFILES = Object.freeze({
  psy: {
    preferred: ['Acid Mutation', 'Laser Fracture', 'Frequency Shift', 'Stereo Orbit'],
    language: 'psychedelic, energetic, spiraling and rhythmically precise'
  },
  forest: {
    preferred: ['Organic Creature FX', 'Granular Dust', 'Reverse Reverb', 'Stereo Orbit'],
    language: 'organic, dark, alive, forest-like and spatially breathing'
  },
  fullon: {
    preferred: ['Noise Riser', 'Reverse Reverb', 'Laser Fracture', 'Gate Stutter'],
    language: 'uplifting, energetic, clean, bright and impact-driven'
  },
  darkpsy: {
    preferred: ['Acid Mutation', 'Frequency Shift', 'Formant Voice FX', 'Tape Collapse'],
    language: 'hostile, ritualistic, distorted, dense and psychologically unstable'
  },
  hitech: {
    preferred: ['Gate Stutter', 'Laser Fracture', 'Frequency Shift', 'Granular Dust'],
    language: 'hyperactive, surgical, glitchy, fast and aggressively mutated'
  },
  hybrid: {
    preferred: ['Acid Mutation', 'Organic Creature FX', 'Laser Fracture', 'Stereo Orbit'],
    language: 'hybrid, evolving, strange, controlled and unpredictable'
  }
});

const FX_PHASE_PROFILES = Object.freeze({
  intro: { density: 'sparse', action: 'Use a few distant Forest/Psy details with restrained movement.' },
  build: { density: 'growing', action: 'Increase filtering, reverse reverb, granular detail and stereo tension.' },
  groove: { density: 'controlled', action: 'Use short, controlled call-and-response FX; keep the kick-bass motor dominant.' },
  breakdown: { density: 'wide', action: 'Open depth and wide atmospheres; layer creature swarms and acid mutations.' },
  predrop: { density: 'focused', action: 'Reduce FX density, pull width inward and maximize tension before the impact.' },
  drop: { density: 'impact', action: 'Kick and rolling bass lead; restore FX afterward above the protected low-end region.' },
  outro: { density: 'dissolving', action: 'Reduce rhythmic FX and let filtered spatial fragments decay into the background.' }
});

const FX_SUBGENRE_LABELS = Object.freeze({
  psy: 'Psytrance',
  forest: 'Forest Psy',
  fullon: 'Full-On',
  darkpsy: 'Dark Psy',
  hitech: 'Hi-Tech',
  hybrid: 'Hybrid / Controlled Chaos'
});

const FX_PHASE_LABELS = Object.freeze({
  intro: 'Intro',
  build: 'Build-up',
  groove: 'Main Groove',
  breakdown: 'Breakdown',
  predrop: 'Pre-Drop',
  drop: 'Drop',
  outro: 'Outro'
});

const FX_MOTION_LABELS = Object.freeze({
  static: 'Static',
  slow: 'Slow Evolving',
  organic: 'Organic Random',
  rhythmic: 'Rhythmic Sync',
  chaotic: 'Controlled Chaos'
});

const SEMANTIC_DICTIONARY = Object.freeze({
  darkpsy: {
    domain: 'subgenre',
    concepts: ['pressure', 'ritual', 'dissonance', 'high motion density', 'dark atmosphere'],
    causalExpectations: ['stable kick-bass motor', 'controlled psychoacoustic instability', 'high-frequency mutation', 'dark spatial depth'],
    conflicts: ['bright commercial EDM', 'happy major melodies', 'soft acoustic arrangement']
  },
  forest: {
    domain: 'subgenre',
    concepts: ['organic movement', 'living environment', 'creature textures', 'deep spatial layers'],
    causalExpectations: ['stable low-end foundation', 'organic upper-frequency motion', 'controlled random modulation', 'dark reverb depth'],
    conflicts: ['overly clean commercial production', 'constant supersaw leads', 'static stereo image']
  },
  dryPunch: {
    domain: 'kick',
    concepts: ['short transient', 'dry impact', 'low-end clarity', 'center focus'],
    causalExpectations: ['cleaner bass window', 'stronger perceived attack', 'reduced low-end masking'],
    conflicts: ['long kick tail', 'wide kick reverb', 'stereo kick processing']
  },
  rolling16: {
    domain: 'bass',
    concepts: ['continuous propulsion', 'sixteenth-note movement', 'hypnotic motor', 'tight sidechain'],
    causalExpectations: ['stable dancefloor momentum', 'kick-bass interlock', 'predictable rhythmic energy'],
    conflicts: ['weak groove tightness', 'long kick tail', 'uncontrolled bass modulation']
  },
  acidHarmonics: {
    domain: 'synth',
    concepts: ['resonant motion', 'upper harmonic energy', 'psychedelic identity'],
    causalExpectations: ['safe stereo expansion above low-midrange', 'filter-driven tension', 'call-and-response potential'],
    conflicts: ['wide subbass', 'unfiltered stereo bass', 'continuous full-width saturation']
  },
  haasSafe: {
    domain: 'psychoacoustic',
    concepts: ['perceived width', 'precedence-based localization', 'upper-frequency spatial movement'],
    causalExpectations: ['wider perception without low-end instability', 'stronger transition contrast', 'depth around a stable center'],
    constraints: ['sub mono below 120 Hz', 'stereo low cut enabled', 'correlation monitoring active']
  }
});

const CAUSAL_RULES = Object.freeze([
  {
    id: 'MOTOR.DRY_KICK.PROTECTION',
    when: context => context.motor.kickStyle === 'dryPunch'
      && context.motor.kickLengthMs <= 100
      && context.motor.safety.kickMono
      && context.motor.safety.dryKick,
    claim: {
      subject: 'Dry Kick',
      cause: 'Short kick length and dry kick path',
      effect: 'Clearer transient window for the rolling bass',
      mechanism: 'Reduced temporal overlap in the low-end',
      confidence: 0.9,
      risk: 'low'
    }
  },
  {
    id: 'MOTOR.DRY_KICK.ROLLING_BASS',
    when: context => context.motor.kickStyle === 'dryPunch'
      && context.motor.bassPattern === 'rolling16'
      && context.motor.kickLengthMs <= 100
      && context.motor.safety.kickMono
      && context.motor.safety.bassSidechain,
    claim: {
      subject: 'Dry Kick + Rolling Bass',
      cause: 'Short dry kick with mono center and sidechained rolling bass',
      effect: 'Stable forward psytrance motor with clear kick-bass separation',
      mechanism: 'The kick transient receives a protected time window before bass recovery',
      confidence: 0.94,
      risk: 'low'
    }
  },
  {
    id: 'PSYCHO.HAAS.MONO_SAFE',
    when: context => context.psycho.mode !== 'off'
      && context.psycho.stereoLowCutHz >= 180
      && context.psycho.safety.subMono
      && context.psycho.safety.correlationMonitor,
    claim: {
      subject: 'Frequency-selective Haas Processing',
      cause: 'Stereo delay only on upper-frequency content with mono low-end protection',
      effect: 'Perceived width without destabilizing kick and subbass',
      mechanism: 'Stereo movement is restricted above the protected low-frequency region',
      confidence: 0.9,
      risk: 'low'
    }
  },
  {
    id: 'PSYCHO.HAAS.ACID_WIDTH_AUDIBLE',
    when: context => context.psycho.mode !== 'off'
      && context.psycho.target === 'acid harmonics'
      && context.psycho.stereoLowCutHz >= 250
      && context.psycho.width > 0
      && context.psycho.safety.subMono
      && context.psycho.safety.correlationMonitor,
    claim: {
      subject: 'Frequency-Selective Acid Width',
      cause: 'Haas processing is targeted to acid harmonics above the configured low cut',
      effect: 'The acid layer is intended to read wider while kick and sub remain centered',
      mechanism: 'The wet stereo layer excludes the protected low-frequency region',
      confidence: 0.78,
      risk: 'low'
    }
  },
  {
    id: 'DROP.STEREO.COLLAPSE',
    when: context => context.psycho.width <= 20
      && context.psycho.wetDry <= 15
      && context.fx.phase === 'predrop',
    claim: {
      subject: 'Pre-Drop Stereo Collapse',
      cause: 'Stereo width and wet Haas signal are reduced before the drop',
      effect: 'Stronger perceived drop impact after the kick-bass re-entry',
      mechanism: 'Contrast between narrow pre-drop space and restored upper-layer width increases perceived impact',
      confidence: 0.84,
      risk: 'low'
    }
  },
  {
    id: 'FX.DENSITY.GROOVE.MASKING',
    when: context => context.fx.density > 75
      && context.fx.chaos > 70
      && context.fx.phase === 'groove',
    claim: {
      subject: 'FX Density Risk',
      cause: 'High FX density and high mutation during the main groove',
      effect: 'Reduced groove readability and kick-bass masking risk',
      mechanism: 'Too many concurrent transient and spectral events compete with the rhythmic motor',
      confidence: 0.88,
      risk: 'high'
    }
  },
  {
    id: 'FOREST.ORGANIC.MOTION',
    when: context => context.fx.subgenre === 'forest'
      && context.fx.motion === 'organic'
      && context.fx.selectedFamilies.includes('Organic Creature FX'),
    claim: {
      subject: 'Forest Organic Motion',
      cause: 'Organic random motion combined with creature-based high-frequency FX',
      effect: 'Living forest-like spatial environment around the stable motor',
      mechanism: 'Irregular upper-layer detail generates perceived ecological movement without interrupting the groove',
      confidence: 0.82,
      risk: 'low'
    }
  }
]);

const FX_LIBRARY = {
  'HAAS SENTINEL': 'Design a real-time psychoacoustic stereo-width audio effect plugin. Signal flow: split input into a protected mono low band and stereo high band; leave all frequencies below Stereo Low Cut centered and unprocessed; independently micro-delay left and right high-band channels; apply mid-side width after delay; detect mono-correlation risk and smoothly reduce side width; detect kick transients and briefly duck the wet Haas layer; finish with output safety limiting. Never widen the kick fundamental or subbass. No Haas or side signal on the sub layer below 120 Hz. Use smooth S-curve width changes, no hard ramps, clicks, obvious echo, hard panning or feedback. Ramp Wet/Dry gently over 4-8 bars. Keep kick bypass continuously active, or increase it slightly during drops. Raise Motion Depth in breakdowns, then reduce it to 10-20% during drops. Tempo-sync Slow Drift, 1 Bar, 1/2 Bar and 1/16 Random modes; Static remains unmodulated. Controls: Stereo Low Cut 120-1000 Hz (Dark Forest Safe Width default 300 Hz); Haas Delay 0-40 ms (default 15 ms); L/R offset -8 to +8 ms (default channel delays Left 0 ms, Right +15 ms); Width 0-100% (default 55%); Wet/Dry 0-100% (default 45%); Motion Mode and Depth (default Slow Drift, 12%); Correlation Threshold +1.0 to -1.0 (default +0.15); Auto Width Reduction 0-100% (default 70%); Kick Bypass Sensitivity (default 60%); Output Trim -12 to +12 dB (default 0 dB); Output Safety Limiter On by default. Include the Dark Forest Safe Width factory preset.',
  'SUB VOID GLUE': 'Multiband low-end glue with subsonic cleanup, soft saturation, kick-aware ducking, mono protection below 120 Hz, and transparent bus compression.',
  'CAVE SPIRAL': 'Dark convolution reverb with filtered feedback delay, slow stereo orbit, and automated wet-send rises before transitions.',
  'ACID MUTATOR': 'Resonant filter, nonlinear drive, bit reduction, stepped random modulation, envelope following, and tempo-synced cutoff motion.',
  'RITUAL PUMPER': 'Kick-keyed sidechain shaping with an adjustable curve, transient-safe release, parallel saturation, and rhythmic 1/16-note pumping.',
  'LASER FRACTURE': 'Frequency shifting, comb filtering, ring modulation, granular delay, and macro-controlled transition sweeps.',
  'STEREO PARASITE': 'Mid-side spectral movement, Haas micro-delay above 350 Hz, autopan, phase-safe low-end protection, and restrained micro-glitches.',
  'ORGANIC DEPTH FIELD': 'Design a real-time depth-field effect for psychedelic FX, organic percussion, drones and creature textures. Split incoming audio into near, middle and far depth layers. Shape distance with frequency-sensitive reverb, subtle early reflections, gentle mid-side movement and filtered delay. Provide near/middle/far balance, early-reflection amount, dark reverb time, high-frequency damping, side width above 300 Hz, slow organic movement rate, random micro-positioning, depth-following filter and Wet/Dry controls. Keep the center clear for kick and bass; do not add stereo width below 180 Hz. Keep movement subtle and avoid constant obvious autopan or unstable image shifts.',
  'SWARM MOTION': 'Create many small, decorrelated, phase-stable motions for insect FX, micro-percussion and granular detail. Use bounded modulation, smooth interpolation and tempo-synced rates; avoid hard panning and unstable comb filtering.',
  'MASK REVEAL': 'Create frequency-selective masking control that makes acid and percussion, or FX and leads, take turns in defined bands. Use smooth dynamic EQ or sidechain envelopes, preserve transients and avoid audible pumping.',
  'DARK ORBIT': 'Create slow tempo-synced 3D pan and stereo-width movement for pads, risers and atmospheric transitions. Keep the dry center stable, low frequencies mono and movement smooth.',
  'DROP COLLAPSE': 'Automate stereo width inward before the main drop, hold a focused center through the impact, then restore upper-frequency width after the kick-bass groove returns. Keep the collapse smooth and mono-safe.'
};

function cleanText(value) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
}

function normalizeModelName(model = 'v6') {
  const normalized = cleanText(model)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^suno-/, '')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');

  const aliases = {
    '6': 'v6-pro-custom',
    '6pro': 'v6-pro-custom',
    '6-pro': 'v6-pro-custom',
    '6-pro-custom': 'v6-pro-custom',
    'v6': 'v6-pro-custom',
    'v6-pro': 'v6-pro-custom',
    'v6-pro-custom': 'v6-pro-custom',
    'v6-custom': 'v6-pro-custom',
    'v6-mini': 'v6-mini',
    '6-wild': 'v6-wild-pro-custom',
    '6-wild-pro': 'v6-wild-pro-custom',
    '6-wild-pro-custom': 'v6-wild-pro-custom',
    'v6-wild': 'v6-wild-pro-custom',
    'v6-wild-pro': 'v6-wild-pro-custom',
    'v6-wild-pro-custom': 'v6-wild-pro-custom',
    'v6-wild-custom': 'v6-wild-pro-custom'
  };

  return aliases[normalized] || normalized || 'v6-pro-custom';
}

function buildSunoWebResearchBrief({ model = 'v6-pro-custom', mood = 'dark psytrance', bpm = 148 } = {}) {
  const normalizedModel = normalizeModelName(model);
  const modelLabel = normalizedModel === 'v6-wild-pro-custom'
    ? 'v6 Wild Pro Custom'
    : normalizedModel === 'v6-mini'
      ? 'v6 Mini'
      : 'v6 Pro Custom';

  return [
    'Suno web practice: explicit section tags and arrangement cues outperform vague genre-only prompts.',
    'MuseLift psy-trance lyric guidance emphasizes [Intro]-[Build]-[Drop]-[Break]-[Peak]-[Outro] tension arcs, direct callouts for bass pressure, and emotional release timing.',
    `Suno v6 / v6 Pro / Studio 2 community patterns favor precise low-end language, mono-safe sub/kick protection, and tight creative constraints for ${mood} at ${bpm} BPM.`,
    `${modelLabel} works best when the prompt separates musical intent, arrangement, mix, and effect motion instead of stacking generic adjectives.`
  ].join(' ');
}

function listText(value) {
  const items = Array.isArray(value) ? value : String(value ?? '').split(',');
  return items.map(cleanText).filter(Boolean).join(', ');
}

function buildWildDirective({ weirdness = 50, influence = 75, diversity = 25, hardAnchors = {} } = {}) {
  const weird = Math.max(0, Math.min(100, Number(weirdness) || 0));
  const styleInfluence = Math.max(0, Math.min(100, Number(influence) || 0));
  const variety = Math.max(0, Math.min(100, Number(diversity) || 0));
  const mutationLevel = weird >= 80 ? 'high' : weird >= 50 ? 'medium' : 'low';
  const mutationCount = weird >= 80 ? 4 : weird >= 50 ? 2 : 1;
  const firstMutation = Math.floor(variety / 100 * WILD_MUTATION_POOL.length);
  const mutations = Array.from(
    { length: mutationCount },
    (_, index) => WILD_MUTATION_POOL[(firstMutation + index) % WILD_MUTATION_POOL.length]
  );
  const anchors = Object.entries(hardAnchors)
    .map(([key, value]) => `${key}: ${cleanText(value)}`)
    .filter(entry => !entry.endsWith(': '))
    .join('; ');

  return [
    'v6-wild exploratory pass.',
    `Mutation intensity: ${mutationLevel}.`,
    `Explore ${mutations.join('; ')}.`,
    'Introduce unexpected psychedelic sound-design events without losing the functional dancefloor groove.',
    'Create unstable but controlled peripheral movement, alien stereo flickers, shifting depth layers and unexpected spectral mutations.',
    'Keep the kick, subbass, tempo and core groove rigidly centered and stable.',
    styleInfluence >= 75
      ? 'Keep the rhythmic, tempo and genre anchors strict.'
      : 'Allow controlled genre hybridization while retaining the core groove.',
    variety >= 70
      ? 'Create a radically distinct interpretation.'
      : 'Vary textures while preserving the central identity.',
    anchors ? `Keep these hard anchors intact: ${anchors}.` : ''
  ].filter(Boolean).join(' ');
}

function buildModelDirective(model, settings = {}) {
  const normalizedModel = normalizeModelName(model);
  const weirdness = Number(settings.weirdness) || 0;
  const influence = Number(settings.influence) || 0;
  const diversity = Number(settings.diversity) || 0;
  const anchors = settings.hardAnchors || {};

  if (normalizedModel === 'v6-wild-pro-custom') {
    return buildWildDirective({ weirdness, influence, diversity, hardAnchors: anchors });
  }

  const anchorText = Object.entries(anchors)
    .map(([key, value]) => `${key}: ${cleanText(value)}`)
    .filter(entry => !entry.endsWith(': '))
    .join('; ');

  if (normalizedModel === 'v6-mini') {
    return [
      'Fast exploratory sketch: prioritize the core groove and usable musical ideas.',
      `Keep style influence at ${influence}% and variation at ${diversity}%.`,
      anchorText ? `Retain these anchors: ${anchorText}.` : ''
    ].filter(Boolean).join(' ');
  }

  return [
    'Controlled, polished execution with a coherent arrangement.',
    `Keep style influence at ${influence}% and variation at ${diversity}%.`,
    weirdness >= 70 ? 'Use only restrained experimental details.' : '',
    anchorText ? `Honor these anchors: ${anchorText}.` : ''
  ].filter(Boolean).join(' ');
}

function buildStylePrompt({
  corePrompt = '',
  model = 'v6',
  settings = {},
  psychoStyleTag = '',
  motorStyleTag = '',
  fxMotionTag = '',
  evidenceClaims = [],
  duration = '06:00',
  customStyle = '',
  maxMode = true,
  negativeStyle = '',
  limit = 1000
} = {}) {
  const coreTags = cleanText(corePrompt).split(',').map(cleanText).filter(Boolean);
  const additionalTags = [
    `target duration ${cleanText(duration)}`,
    cleanText(customStyle) ? `custom style layer: ${cleanText(customStyle)}` : '',
    maxMode ? 'detailed, evolving arrangement' : '',
    cleanText(psychoStyleTag),
    cleanText(motorStyleTag),
    cleanText(fxMotionTag),
    evidenceClaims.length ? `Production intent: ${listText(evidenceClaims)}` : '',
    buildModelDirective(model, settings),
    buildSunoWebResearchBrief({ model, mood: cleanText(corePrompt) || 'dark psytrance', bpm: Number(cleanText(duration).match(/\d+/)?.[0] || 148) }),
    cleanText(negativeStyle) ? `Avoid: ${cleanText(negativeStyle)}.` : ''
  ].filter(Boolean);
  const tags = [...coreTags, ...additionalTags];
  const output = [];
  let truncated = false;

  tags.forEach(tag => {
    const candidate = [...output, tag].join(', ');
    if (candidate.length <= limit) output.push(tag);
    else truncated = true;
  });

  return { text: output.join(', '), truncated, limit };
}

function normalizeMotorSettings(settings = {}) {
  const preset = cleanText(settings.preset) || 'darkRolling';
  const defaults = MOTOR_PRESETS[preset] || MOTOR_PRESETS.darkRolling;
  const number = (key, min, max) => Math.max(min, Math.min(max,
    Number.isFinite(Number(settings[key])) ? Number(settings[key]) : defaults[key]));
  const bassPattern = Object.prototype.hasOwnProperty.call(MOTOR_PATTERNS, settings.bassPattern)
    ? settings.bassPattern
    : defaults.bassPattern;
  const kickStyle = Object.prototype.hasOwnProperty.call(MOTOR_KICKS, settings.kickStyle)
    ? settings.kickStyle
    : defaults.kickStyle;

  return {
    preset,
    bassPattern,
    kickStyle,
    kickLengthMs: number('kickLengthMs', 40, 180),
    kickClick: number('kickClick', 0, 100),
    bassNoteLength: number('bassNoteLength', 20, 100),
    bassDrive: number('bassDrive', 0, 100),
    rubberMovement: number('rubberMovement', 0, 100),
    grooveTightness: number('grooveTightness', 0, 100),
    safety: { ...MOTOR_SAFETY_DEFAULTS, ...(settings.safety || {}) }
  };
}

function buildMotorStyleTag(settings = {}) {
  const motor = normalizeMotorSettings(settings);
  const kickStyle = {
    dryPunch: 'short dry punchy kick',
    shortClick: 'tight short kick with restrained click',
    deepThump: 'deep controlled thumping kick',
    forestKnock: 'organic dry forest knock kick',
    hitechSnap: 'fast sharp hi-tech snap kick'
  }[motor.kickStyle];
  const bassPattern = {
    rolling16: 'relentless rolling 1/16 bassline',
    offbeat: 'deep offbeat bass movement',
    triplet: 'hypnotic triplet bass roll',
    broken: 'mutated broken rolling bass pattern',
    glide: 'gliding elastic bass movement'
  }[motor.bassPattern];

  return [
    kickStyle,
    bassPattern,
    'stable centered kick and mono subbass',
    'tight kick-bass phase relationship',
    `kick length ${motor.kickLengthMs} ms`,
    `bass note length ${motor.bassNoteLength}%`,
    `bass drive ${motor.bassDrive}%`,
    `rubber movement ${motor.rubberMovement}%`,
    `groove tightness ${motor.grooveTightness}%`,
    'dry physical low-end impact',
    'clean sidechained bass recovery',
    'mono-safe dancefloor motor'
  ].join(', ');
}

function auditMotorSettings(settings = {}) {
  const motor = normalizeMotorSettings(settings);
  const warnings = [];

  if (motor.safety.kickMono === false) warnings.push('Kick mono protection is disabled.');
  if (motor.safety.subMono === false) warnings.push('Sub mono protection is disabled.');
  if (motor.safety.phaseLock === false) warnings.push('Kick/Bass phase lock is disabled.');
  if (motor.safety.bassSidechain === false) warnings.push('Bass sidechain is disabled.');
  if (motor.safety.dryKick === false) warnings.push('Dry kick path is disabled.');
  if (motor.safety.lowEndGuard === false) warnings.push('Low-end collision guard is disabled.');
  if (motor.kickLengthMs > 135 && motor.bassNoteLength > 82) {
    warnings.push('Kick and bass are both too long: potential low-end overlap.');
  }
  if (motor.kickLengthMs < 55 && motor.kickClick < 20) {
    warnings.push('Very short kick with low click: kick may lose translation.');
  }
  if (motor.bassDrive > 72 && motor.rubberMovement > 65) {
    warnings.push('High bass drive plus high rubber movement can smear the bass rhythm.');
  }
  if (motor.grooveTightness < 55 && motor.bassPattern === 'rolling16') {
    warnings.push('Rolling 1/16 bass requires more groove tightness.');
  }
  return warnings;
}

function buildMotorStudioBrief(settings = {}) {
  const motor = normalizeMotorSettings(settings);
  const bpm = Math.max(1, Number(settings.bpm) || 148);
  const subgenre = cleanText(settings.subgenre) || 'Dark Psy';
  const pattern = MOTOR_PATTERNS[motor.bassPattern];
  const safety = Object.entries(motor.safety)
    .filter(([key, enabled]) => enabled && MOTOR_SAFETY_LABELS[key])
    .map(([key]) => MOTOR_SAFETY_LABELS[key]);
  const safetyWarnings = auditMotorSettings(motor);

  return [
    'PSYTRANCE MOTOR — STUDIO 2 BRIEF',
    `Core anchor: ${subgenre} psytrance at ${bpm} BPM.`,
    '',
    'Kick:',
    MOTOR_KICKS[motor.kickStyle],
    `Target length: ${motor.kickLengthMs} ms. Click intensity: ${motor.kickClick}%.`,
    'Keep the kick fully centered and mono. Do not add wide reverb or Haas processing to the kick.',
    '',
    'Bass:',
    pattern,
    `Bass note length: ${motor.bassNoteLength}%. Bass drive: ${motor.bassDrive}%.`,
    `Rubber movement: ${motor.rubberMovement}%. Groove tightness: ${motor.grooveTightness}%.`,
    'Keep the fundamental sub mono below 120 Hz.',
    '',
    'Kick / Bass relationship:',
    'Use precise kick-triggered sidechain ducking. Align kick and bass phase at shared downbeats.',
    'Leave a clean transient window after each kick.',
    'Apply stereo movement only to bass harmonics above 180-250 Hz. Do not widen the core bass fundamental.',
    safety.length ? `Enabled safety: ${safety.join('; ')}.` : 'No motor safety protections are enabled.',
    '',
    'Mix target: dry, fast, stable, physical and forward-moving. Keep the kick-bass motor clear in mono, on headphones, club systems and smaller speakers.',
    safetyWarnings.length ? `Audit warnings: ${safetyWarnings.join(' ')}` : ''
  ].filter(Boolean).join('\n');
}

function normalizeFxMotionSettings(settings = {}) {
  const family = Object.prototype.hasOwnProperty.call(FX_MOTION_FAMILIES, settings.family)
    ? settings.family : FX_MOTION_DEFAULTS.family;
  const subgenre = Object.prototype.hasOwnProperty.call(FX_SUBGENRE_PROFILES, settings.subgenre)
    ? settings.subgenre : FX_MOTION_DEFAULTS.subgenre;
  const phase = Object.prototype.hasOwnProperty.call(FX_PHASE_PROFILES, settings.phase)
    ? settings.phase : FX_MOTION_DEFAULTS.phase;
  const motion = Object.prototype.hasOwnProperty.call(FX_MOTION_LABELS, settings.motion)
    ? settings.motion : FX_MOTION_DEFAULTS.motion;
  const selectedFamilies = Array.isArray(settings.selectedFamilies)
    ? settings.selectedFamilies.filter(value => FX_EFFECT_FAMILIES.includes(value))
    : [...FX_MOTION_DEFAULTS.selectedFamilies];
  const range = (key, fallback) => {
    const value = Number(settings[key]);
    return Math.max(0, Math.min(100, Number.isFinite(value) ? value : fallback));
  };
  return {
    family,
    subgenre,
    phase,
    motion,
    energy: range('energy', FX_MOTION_DEFAULTS.energy),
    tension: range('tension', FX_MOTION_DEFAULTS.tension),
    density: range('density', FX_MOTION_DEFAULTS.density),
    width: range('width', FX_MOTION_DEFAULTS.width),
    chaos: range('chaos', FX_MOTION_DEFAULTS.chaos),
    space: range('space', FX_MOTION_DEFAULTS.space),
    selectedFamilies,
    safety: { ...FX_MOTION_DEFAULTS.safety, ...(settings.safety || {}) }
  };
}

function getFxMotionLevel(value) {
  if (value < 20) return 'minimal';
  if (value < 40) return 'subtle';
  if (value < 60) return 'controlled';
  if (value < 80) return 'dense';
  return 'overloaded';
}

function buildFxMotionTag(settings = {}) {
  const fx = normalizeFxMotionSettings(settings);
  const profile = FX_SUBGENRE_PROFILES[fx.subgenre];
  const phase = FX_PHASE_PROFILES[fx.phase];
  return [
    `${fx.family} for ${FX_SUBGENRE_LABELS[fx.subgenre]}: ${profile.language} FX movement`,
    `${getFxMotionLevel(fx.energy)} energy`,
    `${getFxMotionLevel(fx.tension)} tension`,
    `${getFxMotionLevel(fx.density)} FX density`,
    `${fx.width}% controlled stereo width`,
    `${fx.space}% dark spatial depth`,
    `${fx.chaos}% controlled mutation`,
    fx.selectedFamilies.join(', '),
    phase.action,
    'protect the kick and mono subbass',
    'phase-safe upper-frequency motion'
  ].join(', ');
}

function auditFxMotionSettings(settings = {}) {
  const fx = normalizeFxMotionSettings(settings);
  const warnings = [];
  const safetyWarnings = {
    protectKick: 'Kick protection is disabled.',
    protectSub: 'Subbass protection is disabled.',
    highPassFX: 'FX high-pass protection is disabled.',
    sidechainFX: 'FX sidechain is disabled.',
    monoGuard: 'Mono / correlation guard is disabled.'
  };
  Object.entries(safetyWarnings).forEach(([key, message]) => {
    if (fx.safety[key] === false) warnings.push(message);
  });
  if (fx.selectedFamilies.length > 4) warnings.push('Select no more than four FX families at once.');
  if (fx.density > 75 && fx.chaos > 70) {
    warnings.push('High FX density plus high chaos can hide the groove.');
  }
  if (fx.width > 80 && fx.space > 75 && !fx.safety.monoGuard) {
    warnings.push('Very wide and deep FX without mono guard are unsafe.');
  }
  if (fx.phase === 'drop' && fx.density > 75 && !fx.safety.dropMute) {
    warnings.push('High FX density at drop start may weaken kick-bass impact.');
  }
  if (fx.phase === 'groove' && fx.chaos > 70) {
    warnings.push('High chaos during the main groove can reduce hypnotic stability.');
  }
  return warnings;
}

function buildFxMotionPlan(settings = {}) {
  const fx = normalizeFxMotionSettings(settings);
  const profile = FX_SUBGENRE_PROFILES[fx.subgenre];
  const phase = FX_PHASE_PROFILES[fx.phase];
  return [
    'INTELLIGENT FX PLAN',
    '',
    `FX family lens: ${fx.family}`,
    `Subgenre: ${FX_SUBGENRE_LABELS[fx.subgenre]}`,
    `Character: ${profile.language}`,
    `Track phase: ${FX_PHASE_LABELS[fx.phase]}`,
    `Phase behavior: ${phase.action}`,
    `Energy: ${fx.energy}% (${getFxMotionLevel(fx.energy)})`,
    `Tension: ${fx.tension}% (${getFxMotionLevel(fx.tension)})`,
    `FX density: ${fx.density}% (${getFxMotionLevel(fx.density)})`,
    `Stereo width: ${fx.width}%`,
    `Depth / space: ${fx.space}%`,
    `Controlled mutation: ${fx.chaos}%`,
    `Motion mode: ${FX_MOTION_LABELS[fx.motion]}`,
    `Active FX families: ${fx.selectedFamilies.join(', ') || 'No FX selected'}`,
    `Profile suggestions: ${profile.preferred.join(', ')}`,
    '',
    'Recommended behavior:',
    '- Use FX as answers to musical phrases, not as permanent background noise.',
    '- Increase movement toward transitions and leave short gaps before major impacts.',
    '- Let one FX family dominate each moment; preserve the kick-bass groove.',
    '- Keep low-frequency energy clean and apply spatial motion only to safe upper layers.'
  ].join('\n');
}

function buildFxMotionBrief(settings = {}) {
  const fx = normalizeFxMotionSettings(settings);
  const preDropRule = fx.phase === 'predrop'
    ? 'Mute or narrow most FX during the final beat before the drop.'
    : 'Create a short FX reduction before every major kick-bass re-entry.';
  const dropRule = fx.phase === 'drop'
    ? 'Keep the first kick transient clean, then reintroduce only upper-frequency FX.'
    : 'Prepare a clean drop entry by avoiding wide effects on the kick transient.';
  const safety = [
    fx.safety.sidechainFX && 'sidechain FX returns to the kick',
    fx.safety.protectSub && 'keep low-end mono',
    fx.safety.monoGuard && 'apply correlation monitoring to widened FX',
    fx.safety.highPassFX && 'high-pass FX returns above 180-300 Hz',
    fx.safety.protectKick && 'keep the kick dry and centered'
  ].filter(Boolean);

  return [
    'STUDIO 2 — FX AUTOMATION BRIEF',
    '',
    'General routing:',
    '- Keep FX on dedicated return or effect tracks where possible.',
    `- ${FX_MOTION_FAMILIES[fx.family].role}; use ${FX_MOTION_FAMILIES[fx.family].examples}.`,
    `- Apply ${FX_MOTION_LABELS[fx.motion].toLowerCase()} motion at ${fx.width}% width and ${fx.space}% depth.`,
    '',
    'Automation:',
    '- Raise filter cutoff with tension and reverb sends in builds or breakdowns.',
    '- Increase granular density before transitions, then cut delay feedback before impacts.',
    '- Use reverse-reverb tails to lead into sections; keep frequency shifting subtle in the groove.',
    `- Phase action: ${FX_PHASE_PROFILES[fx.phase].action}`,
    `- Energy ${fx.energy}%, tension ${fx.tension}%, density ${fx.density}%, mutation ${fx.chaos}%.`,
    `- ${preDropRule}`,
    `- ${dropRule}`,
    '',
    `Active family palette: ${fx.selectedFamilies.join(', ') || 'No FX selected'}.`,
    `Safety: ${safety.length ? safety.join('; ') : 'Safety protections are disabled'}.`,
    fx.safety.dropMute ? 'Drop mute: briefly mute FX at the drop start, then restore upper-frequency returns.' : '',
    'Do not send kick or subbass through widening effects. Remove excessive reverb and delay tails from the drop entrance.'
  ].filter(Boolean).join('\n');
}

function evaluateCausalRules(input = {}) {
  const context = {
    ...input,
    motor: {
      ...input.motor,
      safety: { ...MOTOR_SAFETY_DEFAULTS, ...(input.motor?.safety || {}) }
    },
    psycho: {
      ...input.psycho,
      mode: input.psycho?.mode || 'off',
      width: Number(input.psycho?.width) || 0,
      wetDry: Number(input.psycho?.wetDry) || 0,
      stereoLowCutHz: Number(input.psycho?.stereoLowCutHz) || 0,
      safety: {
        subMono: true,
        correlationMonitor: true,
        ...(input.psycho?.safety || {})
      }
    },
    fx: {
      ...input.fx,
      phase: input.fx?.phase || 'groove',
      density: Number(input.fx?.density) || 0,
      chaos: Number(input.fx?.chaos) || 0,
      selectedFamilies: Array.isArray(input.fx?.selectedFamilies)
        ? input.fx.selectedFamilies
        : []
    }
  };
  return CAUSAL_RULES
    .filter(rule => rule.when(context))
    .map(rule => {
      const evidenceByRule = {
        'MOTOR.DRY_KICK.PROTECTION': [
          { type: 'user_selection', source: 'motor.kickStyle', value: context.motor.kickStyle },
          { type: 'rule', source: rule.id, value: 'Kick mono and dry path protections are enabled.' }
        ],
        'MOTOR.DRY_KICK.ROLLING_BASS': [
          { type: 'user_selection', source: 'motor.bassPattern', value: context.motor.bassPattern },
          { type: 'rule', source: rule.id, value: 'Kick mono protection and bass sidechain are enabled.' }
        ],
        'PSYCHO.HAAS.MONO_SAFE': [
          { type: 'user_selection', source: 'psycho.stereoLowCutHz', value: context.psycho.stereoLowCutHz },
          { type: 'rule', source: rule.id, value: 'Sub mono and correlation monitoring are enabled.' }
        ],
        'PSYCHO.HAAS.ACID_WIDTH_AUDIBLE': [
          { type: 'user_selection', source: 'psycho.target', value: context.psycho.target },
          { type: 'user_selection', source: 'psycho.stereoLowCutHz', value: context.psycho.stereoLowCutHz },
          { type: 'rule', source: rule.id, value: 'Acid target, low-cut minimum and mono-safety rules match.' }
        ],
        'DROP.STEREO.COLLAPSE': [
          { type: 'user_selection', source: 'fx.phase', value: context.fx.phase },
          { type: 'user_selection', source: 'psycho.width/wetDry', value: `${context.psycho.width}% / ${context.psycho.wetDry}%` }
        ],
        'FX.DENSITY.GROOVE.MASKING': [
          { type: 'user_selection', source: 'fx.density/chaos', value: `${context.fx.density}% / ${context.fx.chaos}%` },
          { type: 'rule', source: rule.id, value: 'Main-groove density and mutation exceed the configured guard thresholds.' }
        ],
        'FOREST.ORGANIC.MOTION': [
          { type: 'user_selection', source: 'fx.subgenre/motion', value: `${context.fx.subgenre} / ${context.fx.motion}` },
          { type: 'user_selection', source: 'fx.selectedFamilies', value: context.fx.selectedFamilies.join(', ') }
        ]
      };
      const contextEvidence = {
        model: context.model || 'v6',
        bpm: Number(context.core?.bpm) || 148,
        genre: context.core?.genre || 'Psytrance',
        trackPhase: FX_PHASE_LABELS[context.fx.phase] || context.fx.phase
      };
      return {
        id: `claim_${rule.id.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        ruleId: rule.id,
        type: 'causal',
        ...rule.claim,
        status: rule.claim.risk === 'high' ? 'warning' : 'supported',
        context: contextEvidence,
        evidence: [
          {
            type: 'current_state',
            description: 'The active engine state matches the rule conditions.',
            timestamp: new Date().toISOString()
          },
          ...(evidenceByRule[rule.id] || []),
          {
            type: 'rule',
            source: rule.id,
            description: 'Causal relationship defined by the generator rule system.'
          }
        ]
      };
    });
}

function buildSemanticInterpretation(context = {}) {
  const entries = [];
  const genre = cleanText(context.core?.genre).toLowerCase();
  const genreKey = genre.includes('dark') ? 'darkpsy' : genre.includes('forest') ? 'forest' : '';
  const keys = [
    genreKey,
    context.motor?.kickStyle,
    context.motor?.bassPattern,
    context.psycho?.target === 'acid harmonics' ? 'acidHarmonics' : '',
    context.psycho?.mode && context.psycho.mode !== 'off' ? 'haasSafe' : ''
  ].filter(Boolean);
  const seen = new Set();
  keys.forEach(key => {
    if (!SEMANTIC_DICTIONARY[key] || seen.has(key)) return;
    seen.add(key);
    entries.push({ term: key, ...SEMANTIC_DICTIONARY[key] });
  });
  return entries;
}

function findSemanticConflicts(context = {}) {
  const genre = cleanText(context.core?.genre).toLowerCase();
  const selectedIntent = [
    ...(context.core?.moods || []),
    ...(context.core?.sonicElements || [])
  ].join(' ').toLowerCase();
  const conflicts = [];
  if (genre.includes('dark') && /\b(happy|major[- ]key|commercial edm|soft acoustic)\b/.test(selectedIntent)) {
    conflicts.push('Semantic conflict: selected positive/major/acoustic material may oppose the Dark Psy pressure and ritual target.');
  }
  if (genre.includes('forest') && /\b(constant supersaw|static stereo)\b/.test(selectedIntent)) {
    conflicts.push('Semantic conflict: selected static or constant supersaw material may oppose Forest FX movement and spatial depth.');
  }
  return conflicts;
}

function buildProductionEvidenceState({
  context = {},
  warnings = [],
  feedback = {},
  audioMetrics = {},
  stylePrompt = '',
  studioBrief = ''
} = {}) {
  const reviewKeysByRule = {
    'MOTOR.DRY_KICK.ROLLING_BASS': ['subMonoStable'],
    'PSYCHO.HAAS.MONO_SAFE': ['subMonoStable'],
    'PSYCHO.HAAS.ACID_WIDTH_AUDIBLE': ['acidWidthAudible'],
    'DROP.STEREO.COLLAPSE': ['dropClearer']
  };
  const correlation = audioMetrics.stereoCorrelation;
  const hasCorrelation = correlation !== '' && correlation !== null && correlation !== undefined;
  const correlationValue = hasCorrelation ? Number(correlation) : NaN;
  const validCorrelation = Number.isFinite(correlationValue)
    && correlationValue >= -1
    && correlationValue <= 1;
  const measuredCorrelation = validCorrelation ? correlationValue : null;
  const semanticConflicts = findSemanticConflicts(context);
  const conflicts = [...warnings.map(cleanText).filter(Boolean), ...semanticConflicts];
  if (hasCorrelation && !validCorrelation) {
    conflicts.push('Manual DAW correlation must be a number from -1.00 to +1.00.');
  }
  if (measuredCorrelation !== null && measuredCorrelation < 0.15) {
    conflicts.push(`Manual DAW correlation ${measuredCorrelation.toFixed(2)} is below the +0.15 review threshold.`);
  }
  const claims = evaluateCausalRules(context).map(claim => {
    const priorConfidence = claim.confidence;
    const reviewKey = reviewKeysByRule[claim.ruleId]?.find(key =>
      feedback[key] !== '' && feedback[key] !== null && feedback[key] !== undefined
      && Number.isFinite(Number(feedback[key]))
    );
    const rating = reviewKey ? Math.max(1, Math.min(5, Number(feedback[reviewKey]))) : null;
    const ratingDelta = rating === null ? 0 : (rating - 3) * 0.05;
    const metricDelta = measuredCorrelation === null
      || !['PSYCHO.HAAS.MONO_SAFE', 'PSYCHO.HAAS.ACID_WIDTH_AUDIBLE'].includes(claim.ruleId)
      ? 0
      : measuredCorrelation >= 0.15 ? 0.03 : -0.1;
    const updatedConfidence = Math.max(0, Math.min(1, priorConfidence + ratingDelta + metricDelta));
    const correlationReviewClaim = ['PSYCHO.HAAS.MONO_SAFE', 'PSYCHO.HAAS.ACID_WIDTH_AUDIBLE'].includes(claim.ruleId);
    const reviewRisk = rating !== null && rating <= 2;
    const metricRisk = correlationReviewClaim && measuredCorrelation !== null && measuredCorrelation < 0.15;
    const risk = reviewRisk || metricRisk ? 'high' : claim.risk;
    const feedbackEvidence = [
      rating === null ? null : { type: 'user_rating', source: reviewKey, value: `${rating}/5` },
      measuredCorrelation === null
        || !['PSYCHO.HAAS.MONO_SAFE', 'PSYCHO.HAAS.ACID_WIDTH_AUDIBLE'].includes(claim.ruleId)
        ? null
        : { type: 'audio_metric', source: 'user-entered DAW stereo correlation', value: measuredCorrelation }
    ].filter(Boolean);
    return {
      ...claim,
      priorConfidence,
      confidence: Number(updatedConfidence.toFixed(2)),
      risk,
      status: risk === 'high' ? 'warning' : updatedConfidence < 0.6 ? 'review' : 'supported',
      evidence: [...claim.evidence, ...feedbackEvidence],
      feedback: rating === null ? null : { key: reviewKey, rating },
      metricEvidence: measuredCorrelation === null ? null : {
        source: 'user-entered DAW correlation',
        value: measuredCorrelation
      }
    };
  });
  claims.forEach(claim => {
    if (claim.feedback?.rating <= 2) {
      conflicts.push(`Manual review for ${claim.subject} is low (${claim.feedback.rating}/5); revise and re-audit this claim.`);
    }
  });
  const conflictList = [...new Set(conflicts)];
  const confidence = claims.length
    ? Math.round(claims.reduce((sum, claim) => sum + claim.confidence, 0) / claims.length * 100)
    : 0;
  const criticalWarning = conflictList.some(warning => /kick|sub|mono|phase|overlap|unsafe|below the \+0\.15/i.test(warning));
  const risk = criticalWarning ? 'high' : conflictList.length ? 'moderate' : 'low';
  const confidenceLabel = confidence >= 80 ? 'high' : confidence >= 60 ? 'moderate' : confidence > 0 ? 'low' : 'not assessed';
  const semanticInterpretation = buildSemanticInterpretation(context);
  const recommendations = conflictList.length
    ? [...conflictList]
    : ['Keep mono and phase checks enabled; audition the generated plan against the actual audio in a DAW.'];
  const ratingCount = Object.values(feedback).filter(value =>
    value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value))
  ).length;
  const auditTrail = [
    { stage: 'INPUT', result: 'Captured current Core, motor, Psycho and FX selections.' },
    { stage: 'SEMANTIC INTERPRETATION', result: semanticInterpretation },
    { stage: 'CAUSAL RULES', result: claims.map(claim => claim.ruleId) },
    { stage: 'EVIDENCE ASSESSMENT', result: `${confidenceLabel} confidence across matched rules; ${ratingCount} user rating(s) and ${measuredCorrelation === null ? 0 : 1} manual metric(s) supplied. This is a heuristic, not a calibrated probability.` },
    { stage: 'GUARD / CONFLICT CHECK', result: conflictList.length ? conflictList : ['No configured guard conflicts.'] },
    { stage: 'PROMPT / STUDIO BRIEF', result: 'Generated from the current shared application state.' },
    { stage: 'SNAPSHOT', result: 'This evidence state and its generated-output references are included in the snapshot.' }
  ];

  return {
    claims,
    rules: claims.map(claim => claim.ruleId),
    conflicts: conflictList,
    recommendations,
    auditTrail,
    confidence,
    confidenceLabel,
    risk,
    audit: conflictList.length ? 'warnings' : 'passed',
    semanticInterpretation,
    context,
    promptClaim: context.psycho?.mode && context.psycho.mode !== 'off'
      ? `Haas above ${context.psycho.stereoLowCutHz} Hz is configured to target ${context.psycho.target} for ${context.psycho.width}% width.`
      : '',
    evidenceScope: 'User-selected parameters, deterministic application rules, and optional user-entered ratings or DAW metrics; no audio signal is analyzed.',
    semanticConflicts,
    evidenceAssessment: {
      source: 'Selected controls plus manual user feedback',
      confidenceBasis: 'Average of matched rule priors, adjusted by manual review ratings and correlation input.',
      confidenceIsCalibratedProbability: false,
      metricCorrelation: measuredCorrelation
    },
    feedback: { ...feedback },
    generated: { stylePrompt: cleanText(stylePrompt), studioBrief: cleanText(studioBrief) }
  };
}

function formatProductionEvidence(evidence = {}) {
  const formatList = values => values?.length ? values.map(value => {
    if (typeof value === 'string') return `- ${value}`;
    if (value.term) {
      const expectations = value.causalExpectations?.join('; ') || '';
      const constraints = value.constraints?.join('; ') || '';
      const conflicts = value.conflicts?.join('; ') || '';
      return `- ${value.term} (${value.domain}): ${value.concepts.join(', ')}. Expected: ${expectations}.${constraints ? ` Constraints: ${constraints}.` : ''}${conflicts ? ` Avoid: ${conflicts}.` : ''}`;
    }
    if (value.stage) {
      return `- ${value.stage}: ${Array.isArray(value.result) ? value.result.join('; ') : value.result}`;
    }
    if (value.subject) {
      const evidenceText = value.evidence?.map(item => `${item.type}: ${item.source || item.description}${item.value ? ` (${item.value})` : ''}`).join('; ') || 'No evidence items';
      const feedbackText = value.feedback ? ` Manual review: ${value.feedback.rating}/5.` : '';
      const metricText = value.metricEvidence ? ` ${value.metricEvidence.source}: ${Number(value.metricEvidence.value).toFixed(2)}.` : '';
      return `- ${value.ruleId} [${value.status}, ${Math.round(value.confidence * 100)}%, ${value.risk} risk]: ${value.subject}. Cause: ${value.cause}. Effect: ${value.effect}. Mechanism: ${value.mechanism}. Evidence: ${evidenceText}.${feedbackText}${metricText}`;
    }
    return `- ${JSON.stringify(value)}`;
  }).join('\n') : '- None';
  const feedbackLabels = {
    subMonoStable: 'Sub mono-stability',
    acidWidthAudible: 'Audible acid width',
    dropClearer: 'Drop clarity'
  };
  const feedbackText = Object.entries(evidence.feedback || {})
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .map(([key, value]) => `- ${feedbackLabels[key] || key}: ${value}/5`)
    .join('\n');
  return [
    'SEMANTIC CAUSAL EVIDENCE',
    '',
    'INPUT',
    evidence.evidenceScope || 'No evidence scope available.',
    '',
    'SEMANTIC INTERPRETATION',
    formatList(evidence.semanticInterpretation),
    '',
    'PROMPT CLAIM',
    evidence.promptClaim || 'No active psychoacoustic width claim.',
    '',
    'MANUAL AUDIO REVIEW',
    feedbackText || '- No user ratings entered.',
    evidence.evidenceAssessment?.metricCorrelation !== null && evidence.evidenceAssessment?.metricCorrelation !== undefined
      ? `DAW correlation entered by user: ${Number(evidence.evidenceAssessment.metricCorrelation).toFixed(2)}.`
      : 'No DAW correlation metric entered.',
    '',
    'CAUSAL CLAIMS',
    formatList(evidence.claims),
    '',
    'GUARD / CONFLICT CHECK',
    `Audit: ${evidence.audit || 'not assessed'}; risk: ${evidence.risk || 'not assessed'}.`,
    formatList(evidence.conflicts),
    '',
    'EVIDENCE ASSESSMENT',
    `Configuration-rule confidence: ${evidence.confidence ?? 0}% (${evidence.confidenceLabel || 'not assessed'}).`,
    `Risk: ${evidence.risk || 'not assessed'}. Audit: ${evidence.audit || 'not assessed'}.`,
    'This score is a heuristic based on matched rules and optional manual feedback, not measured audio quality or a calibrated probability.',
    evidence.evidenceAssessment?.metricCorrelation !== null && evidence.evidenceAssessment?.metricCorrelation !== undefined
      ? `User-entered stereo correlation: ${Number(evidence.evidenceAssessment.metricCorrelation).toFixed(2)}.`
      : 'No DAW audio metric has been entered.',
    '',
    'RECOMMENDATIONS',
    formatList(evidence.recommendations),
    '',
    'AUDIT TRAIL',
    formatList(evidence.auditTrail?.map(step => `${step.stage}: ${Array.isArray(step.result) ? step.result.join('; ') : step.result}`))
  ].join('\n');
}

function buildSourceRequest(sources = [], intent = '') {
  const entries = sources.filter(source =>
    cleanText(source.label) || cleanText(source.role)
  );
  const intentText = cleanText(intent);
  if (!entries.length) {
    return [
      'MULTI-SOURCE REQUEST',
      'No external sources attached.',
      '',
      `Concept intent: ${intentText || 'Use the shared Core prompt as the complete creative brief.'}`
    ].join('\n');
  }

  const sourceLines = entries.map(source => [
    `- ${cleanText(source.type) || 'SOURCE'} | Weight: ${cleanText(source.weight) || 'Supporting'}`,
    `  Source: ${cleanText(source.label) || 'unnamed'}`,
    `  Role: ${cleanText(source.role) || 'not defined'}`,
    `  Preserve: ${listText(source.preserve) || 'not defined'}`,
    `  Transform: ${listText(source.transform) || 'not defined'}`
  ].join('\n'));

  return [
    'MULTI-SOURCE REQUEST',
    ...sourceLines,
    '',
    `Global transformation intent: ${intentText || 'Create an original, coherent result.'}`,
    '',
    'Use each source only for its stated role. Preserve useful musical anchors, transform the designated qualities, and create an original result rather than reproducing any source literally.'
  ].join('\n');
}

function buildStudioBrief({ targets = [], bpm = '', mix = '', subgenre = '', effects = [] } = {}) {
  const chosenTargets = targets.map(cleanText).filter(Boolean);
  const chosenEffects = effects.map(cleanText).filter(Boolean);
  const research = buildSunoWebResearchBrief({ model: 'v6-pro-custom', mood: cleanText(subgenre) || 'dark psytrance', bpm: Number(String(bpm).replace(/\D/g, '')) || 148 });
  return [
    'STUDIO 2 PRODUCTION BRIEF',
    `Targets: ${chosenTargets.join(', ') || 'Full generation'}`,
    `Core: ${cleanText(subgenre)} psytrance, ${cleanText(bpm)} BPM`,
    `Mix identity: ${cleanText(mix)}`,
    '',
    'Web evidence:',
    research,
    '',
    'Workflow:',
    '1. Create or separate kick, bass, percussion, acid and atmosphere layers where applicable.',
    '2. Use MIDI as an editable seed for bass and acid motifs when useful.',
    '3. Build a focused wavetable synth patch for the lead or acid layer.',
    '4. Automate filter cutoff, reverb send, delay feedback, stereo width and transition intensity.',
    `5. Develop selected FX chains: ${chosenEffects.join(', ') || 'none'}.`,
    '6. Keep the sub frequencies mono, maintain kick/bass separation, and export editable stems or MIDI when available.'
  ].join('\n');
}

function buildEffectBrief(effects = [], psychoSettings = {}) {
  const knownEffects = effects.map(cleanText).filter(name => Object.hasOwn(FX_LIBRARY, name));
  if (!knownEffects.length) {
    return 'No custom effect selected. Choose an FX Lab preset to create a plugin brief.';
  }
  return knownEffects.map(name => {
    const settings = name === 'HAAS SENTINEL'
      ? `\n\nCurrent design: ${buildHaasBrief(psychoSettings)}`
      : '';
    return `${name}\n${FX_LIBRARY[name]}${settings}`;
  }).join('\n\n');
}

function buildPsychoStyleTag({
  mode = 'off',
  target = 'acid harmonics',
  delayMs = 0,
  lowCutHz = 250,
  intensity = 0,
  motion = 'none'
} = {}) {
  const protectedTarget = ['kick', 'subbass', 'sub bass'].includes(cleanText(target).toLowerCase());
  if (mode === 'off' || protectedTarget) {
    return 'stable focused stereo image, mono-compatible low-end';
  }

  const motionMap = {
    none: 'static stereo width',
    slow: 'slow evolving stereo motion',
    bar: 'bar-synced stereo movement',
    halfbar: 'half-bar rhythmic stereo movement',
    sixteenth: 'tempo-synced 1/16 random micro-stereo motion'
  };

  return [
    'stable centered kick and subbass',
    `wide ${cleanText(target)}`,
    `${Number(intensity)}% controlled stereo intensity`,
    `phase-safe width above ${Number(lowCutHz)} Hz`,
    `${Number(delayMs)} ms psychoacoustic stereo spread`,
    motionMap[motion] || motionMap.none,
    'dark spatial depth',
    'mono-safe dancefloor translation'
  ].join(', ');
}

function describeHaasChannelDelays(delayMs, offsetMs, stereoSide = 'right') {
  const adjustedDelay = Number(delayMs) + Number(offsetMs);
  if (stereoSide === 'left') return `Left ${adjustedDelay} ms, Right 0 ms`;
  if (stereoSide === 'alternating') return `alternating L/R around ${Number(delayMs)} ms with ${Number(offsetMs)} ms offset`;
  if (stereoSide === 'random') return `random L/R micro-offset around ${Number(delayMs)} ms`;
  return `Left 0 ms, Right ${adjustedDelay} ms`;
}

function buildPsychoStudioBrief(settings = {}) {
  settings = {
    mode: 'off',
    target: 'acid harmonics',
    delayMs: 15,
    lowCutHz: 300,
    intensity: 55,
    motion: 'slow',
    offsetMs: 0,
    stereoSide: 'right',
    motionDepth: 12,
    correlationThreshold: 0.15,
    autoWidthReductionAmount: 70,
    kickBypassSensitivity: 60,
    wetDryMix: 45,
    outputTrimDb: 0,
    outputLimiter: true,
    ...settings,
    safety: {
      subMono: true,
      sideLowCut: true,
      correlationMonitor: true,
      kickTransientBypass: true,
      autoWidthReduction: true,
      ...(settings.safety || {})
    }
  };
  const target = cleanText(settings.target);
  const protectedTarget = ['kick', 'subbass', 'sub bass'].includes(target.toLowerCase());
  if (settings.mode === 'off' || protectedTarget) {
    return [
      'PSYCHOACOUSTIC STUDIO 2 BRIEF',
      `Haas movement: Off for ${target || 'this target'}. Keep it centered; the sub layer below 120 Hz receives no stereo delay, Haas or side signal.`,
      '',
      buildTrackHaasGuide()
    ].join('\n');
  }

  const safety = settings.safety || {};
  const modeLabels = {
    static: 'static stereo spread',
    automated: 'automated stereo movement',
    organic: 'organic random motion'
  };
  const motionLabels = {
    none: 'no movement',
    slow: 'slow evolving movement',
    bar: '1 bar modulation',
    halfbar: '1/2 bar modulation',
    sixteenth: 'tempo-synced 1/16 random micro-movement'
  };
  const mode = modeLabels[settings.mode] || 'automated stereo movement';
  const motion = motionLabels[settings.motion] || motionLabels.slow;
  const automation = [
    'Increase stereo width during transitions and breakdowns.',
    'Reduce width smoothly immediately before the main drop.',
    'Restore upper-harmonic width after the kick-bass groove returns.',
    safety.kickTransientBypass ? 'Bypass the wet Haas layer on kick transients.' : '',
    safety.autoWidthReduction
      ? `When correlation falls below ${Number(settings.correlationThreshold).toFixed(2)}, smoothly reduce side width by up to ${Number(settings.autoWidthReductionAmount)}%.`
      : 'Monitor correlation continuously and manually narrow the side image before mono compatibility degrades.'
  ].filter(Boolean);
  const mixSafety = [
    safety.sideLowCut ? `Apply a side-channel low cut at ${Number(settings.lowCutHz)} Hz.` : '',
    safety.subMono ? 'Keep all content below 120 Hz mono.' : 'WARNING: sub-mono protection is disabled; restore it before using Haas widening.',
    safety.correlationMonitor ? 'Continuously monitor mono compatibility and stereo correlation.' : 'WARNING: correlation monitoring is disabled; enable it before widening.',
    'Never widen the subbass or fundamental kick frequencies.'
  ].filter(Boolean);

  return [
    'PSYCHOACOUSTIC STUDIO 2 BRIEF',
    `Target:\n${cleanText(settings.target)}.`,
    '',
    'Mono foundation:',
    'Kick and subbass remain stable in the center; the sub layer below 120 Hz has no Haas processing or side signal.',
    '',
    'Stereo character:',
    'Widen only acid harmonics, mid-bass upper harmonics, atmosphere and FX above the protected low-end crossover.',
    '',
    'Stereo architecture:',
    `Keep kick and all content below 120 Hz strictly mono. Create width only above ${Number(settings.lowCutHz)} Hz.`,
    `Apply controlled psychoacoustic left-right delay to upper harmonics; channel delays: ${describeHaasChannelDelays(settings.delayMs, settings.offsetMs, settings.stereoSide)} (L/R offset ${Number(settings.offsetMs)} ms).`,
    'Keep the dry center audible at all times.',
    '',
    'Haas movement:',
    `Delay target: ${Number(settings.delayMs)} ms.`,
    `Mode: ${mode}.`,
    `Motion: ${motion} at ${Number(settings.motionDepth)}% depth.`,
    `Stereo intensity: ${Number(settings.intensity)}%.`,
    'Use a slow S-curve for width rather than a hard ramp. Ramp Wet/Dry gently over 4-8 bars.',
    'Keep kick bypass continuously active, or increase it slightly during drops. Raise Motion Depth in breakdowns, then reduce it to 10-20% during drops.',
    '',
    'Automation:',
    ...automation.map(line => `- ${line}`),
    '',
    'Mix safety:',
    ...mixSafety.map(line => `- ${line}`),
    `Wet/dry: ${Number(settings.wetDryMix)}%.`,
    `Output trim: ${Number(settings.outputTrimDb ?? 0)} dB.`,
    `Output limiter: ${settings.outputLimiter ? 'On' : 'Off'}.`,
    '',
    'Arrangement width automation (use smooth S-curves):',
    'Intro: low width, high focus. Build-up: slowly raise Wet/Dry and width. Just before the drop: sharply narrow width to make room for the kick-bass return. After the drop: reopen only acid, FX and upper atmospheres; do not alter kick or sub. Breakdown: allow maximum width only while the low cut remains active. Outro: slowly reduce width or transition into a spatial FX field.',
    'Bars 1-8: Width 25%, Wet/Dry 20%; keep acid close, focused and controlled.',
    'Bars 1-8: 10 ms delay, 5% Motion Depth; narrow, controlled groove.',
    'Bars 9-12: Width 40%, Wet/Dry 32%, 12 ms delay, 10% Motion Depth; slowly open upper frequencies.',
    'Bars 13-15: Width 60%, Wet/Dry 50%, 15 ms delay, 18% Motion Depth; expand acid, atmosphere and FX into the breakdown.',
    'Bar 16, beat 4: Width 15%, Wet/Dry 10%, 5 ms delay, Motion Depth 0%; collapse the field toward center before the drop.',
    'Bars 17-24: Width 55%, Wet/Dry 45%, 14 ms delay, 12% Motion Depth; restore controlled upper width while kick and bass stay stable.',
    'Bars 25-32: Width 65%, Wet/Dry 55%, 18 ms delay, 22% Motion Depth; increase psychedelic movement on upper layers.',
    'Final transition: Width 75%, Wet/Dry 65%, 22 ms delay, 28% Motion Depth; reserve this wider setting for FX-focused transition layers, never kick or sub.',
    'Immediately after the drop, restore controlled width on upper harmonics only: 45-55% width, 35-45% wet, Slow Drift at low depth. Widen acid, atmosphere and FX only; kick and every subbass frequency stay fully centered and mono.',
    'Gradually increase Haas Wet/Dry and width through the build-up, contract just before the drop, then reopen only above the protected 300 Hz side-channel low cut. Use correlation-based auto-width reduction to protect mono compatibility. Keep kick bypass active or slightly stronger in the drop; increase Motion Depth in breakdowns and reduce it to 10-20% for drops. Shape width with a slow S-curve and Wet/Dry with a smooth 4-8 bar ramp, not hard steps.',
    'Intro: low width and focused center. Outro: slowly reduce width or transition into a spatial FX field. Use MIDI Learn with a compatible controller to record automation performance.',
    '',
    'Recommended effect order:',
    '1. EQ  2. Distortion  3. HAAS SENTINEL  4. Tempo-synced Delay  5. Convolution / Reverb  6. Output Trim / Limiter',
    'EQ: high-pass 180-250 Hz; optional presence boost 1.8-3.5 kHz. Distortion: moderate drive, 25-45% mix. Delay: 1/8 or dotted 1/8, low-to-medium feedback, 4-7 kHz high-cut. Convolution: dark cavern / underground impulse, 8-18% wet.',
    'Rolling mid-bass layer: EQ before HAAS SENTINEL; high-pass its wet path at 180-250 Hz; 10-14 ms delay, 25-40% width, 20-35% Wet/Dry; Static or Slow Drift.',
    '',
    buildTrackHaasGuide(),
    '',
    'Mono compatibility test (use an external DAW/analyzer for a true mono sum; do not assume Studio 2 provides a mono-sum switch or correlation meter):',
    '1. A/B the track with HAAS SENTINEL bypassed and enabled. 2. Set Wet/Dry to 0% and confirm the core groove remains intact. 3. Automate Width to 0% over a short test loop and confirm the dry core still works. 4. Verify the wet-path low cut: at least 180-250 Hz for mid-bass and about 400 Hz or higher for FX. 5. Solo kick and sub; confirm neither uses Haas, stereo delay, wide reverb or unfiltered stereo saturation. 6. Export a test section covering the final eight bars before the drop and the drop where range export is available. In an external mono sum, listen for lost kick punch, weak/fluctuating sub, vanishing acid/FX or flanging. If present, reduce delay, wet mix and Motion Depth, raise the low cut, and restrict Haas to higher frequencies.'
  ].join('\n');
}

function buildTrackHaasGuide() {
  return [
    'HAAS SENTINEL — SOURCE STARTING POINTS (keep kick and subbass mono):',
    ...HAAS_TARGET_GUIDES.map(({ target, use, start }) => `- ${target} | Haas: ${use} | ${start}`)
  ].join('\n');
}

function buildHaasBrief(input = {}) {
  const mode = input.mode ?? input.haasMode ?? 'off';
  const target = input.target ?? input.haasTarget ?? 'acid harmonics';
  const delayMs = Number(input.delayMs ?? input.haasDelayMs ?? 0);
  const lowCutHz = Number(input.lowCutHz ?? input.stereoLowCutHz ?? 250);
  const intensity = Number(input.intensity ?? input.stereoIntensity ?? 0);
  const motion = input.motion ?? input.motionRate ?? 'none';
  const offsetMs = Number(input.offsetMs ?? input.leftRightOffsetMs ?? 0);
  const stereoSide = input.stereoSide ?? 'right';
  const motionDepth = Number(input.motionDepth ?? 0);
  const correlationThreshold = Number(input.correlationThreshold ?? 0.15);
  const autoWidthReductionAmount = Number(input.autoWidthReductionAmount ?? 70);
  const kickBypassSensitivity = Number(input.kickBypassSensitivity ?? 60);
  const wetDryMix = Number(input.wetDryMix ?? 55);
  const outputTrimDb = Number(input.outputTrimDb ?? 0);
  const outputLimiter = input.outputLimiter ?? true;
  const safety = input.safety || {};
  const protectedTarget = ['kick', 'subbass', 'sub bass'].includes(cleanText(target).toLowerCase());
  if (protectedTarget) {
    return `HAAS SENTINEL is not applied to ${cleanText(target)}. Keep this source mono and centered with no stereo delay or side signal; protect the sub layer below 120 Hz.`;
  }

  const safetyInstructions = [
    safety.subMono !== false ? 'keep the sub mono below 120 Hz with no side signal' : '',
    safety.sideLowCut !== false ? `leave the low band below ${lowCutHz} Hz centered and unprocessed; high-pass the wet stereo side at ${lowCutHz} Hz` : '',
    safety.correlationMonitor ? 'monitor stereo correlation and mono compatibility' : '',
    safety.kickTransientBypass ? `duck or bypass the wet Haas path on kick transients at ${kickBypassSensitivity}% sensitivity` : '',
    safety.autoWidthReduction ? `smoothly reduce side width below a correlation threshold of ${Number(correlationThreshold).toFixed(2)}, by up to ${autoWidthReductionAmount}%` : '',
    safety.dropOnlyActivation ? 'enable the effect only during the drop' : ''
  ].filter(Boolean);

  return [
    `HAAS SENTINEL real-time plugin design for ${cleanText(target)}: ${cleanText(mode)} mode, ${delayMs} ms Haas delay, ${intensity}% width, ${wetDryMix}% Wet/Dry.`,
    `Signal flow: split into protected mono low band and stereo high band; leave everything below ${lowCutHz} Hz centered and unprocessed; independently micro-delay L/R high-band channels (${describeHaasChannelDelays(delayMs, offsetMs, stereoSide)}; offset ${offsetMs} ms); apply mid-side width after delay; detect mono-correlation risk and smoothly reduce side width; detect kick transients and briefly duck the wet Haas layer; apply ${outputTrimDb} dB output trim and safety limiting.`,
    `Tempo-sync ${cleanText(motion)} motion at ${motionDepth}% depth. Shape width with a slow S-curve, never a hard ramp; ramp Wet/Dry (${wetDryMix}%) gently over 4-8 bars. Keep kick bypass active continuously or slightly stronger during drops; lift Motion Depth during breakdowns, then reduce it to 10-20% in drops.`,
    safetyInstructions.length ? `Safety: ${safetyInstructions.join('; ')}.` : 'Safety: mono-check the result and keep the sub centered.',
    outputLimiter ? 'Output Safety Limiter: On; use transparent limiting.' : 'Output Safety Limiter: Off.',
    'Avoid obvious echo, abrupt clicks, hard panning, feedback and sudden width changes.',
    'Factory preset: Dark Forest Safe Width — Acid harmonics, 300 Hz low cut, 15 ms Haas delay (Left 0 ms / Right +15 ms), 55% width, 45% Wet/Dry, Slow Drift at 12%, +0.15 correlation threshold, 70% auto width reduction, 60% kick bypass sensitivity, 0 dB trim and limiter On.',
    Number(delayMs) > 25 ? 'Caution: this delay may create audible pre-echo; audition it in mono and reduce the delay if transients smear.' : ''
  ].filter(Boolean).join(' ');
}

function auditPsychoSettings(settings = {}) {
  const warnings = [];
  const mode = settings.haasMode ?? settings.mode ?? 'off';
  const target = cleanText(settings.haasTarget ?? settings.target);
  const lowCut = Number(settings.stereoLowCutHz ?? settings.lowCutHz) || 0;
  const delay = Number(settings.haasDelayMs ?? settings.delayMs) || 0;
  const intensity = Number(settings.stereoIntensity ?? settings.intensity) || 0;
  const motion = settings.motionRate ?? settings.motion ?? 'none';
  const motionDepth = Number(settings.motionDepth) || 0;
  const safety = settings.safety || {};

  if (mode !== 'off' && ['kick', 'subbass', 'sub bass'].includes(target.toLowerCase())) {
    warnings.push('Target-Guard: Kick und Subbass dürfen nicht durch HAAS SENTINEL verarbeitet werden; Quelle mono und zentriert halten.');
  }
  if (mode !== 'off' && lowCut < 120) {
    warnings.push('Haas-Guard: Stereo-Low-Cut liegt unter 120 Hz. Sub muss mono bleiben.');
  }
  if (mode !== 'off' && target === 'mid-bass texture' && lowCut < 180) {
    warnings.push('Mid-Bass-Guard: Für Haas auf Mid-Bass ist ein Side-Low-Cut ab mindestens 180 Hz empfohlen.');
  }
  if (mode !== 'off' && target === 'acid harmonics' && lowCut < 250) {
    warnings.push('Acid-Guard: Für Acid-Harmonien ist ein Stereo-Low-Cut ab mindestens 250 Hz empfohlen.');
  }
  if (delay > 30 && intensity > 75) {
    warnings.push('Phase-Guard: Sehr langer Haas-Delay plus hohe Breite kann Echo-Wahrnehmung und Mono-Auslöschungen erzeugen.');
  }
  if (motion === 'sixteenth' && target === 'atmospheric drones') {
    warnings.push('Motion-Guard: 1/16-Stereo-Bewegung ist für lange Drones oft zu nervös. Nutze Slow oder 1 Bar.');
  }
  if (mode !== 'off' && motionDepth > 60 && intensity > 70) {
    warnings.push('Motion-Guard: Sehr hohe Breite plus Motion Depth kann das Stereobild destabilisieren.');
  }
  if (mode !== 'off' && (
    safety.sideLowCut === false
    || safety.kickTransientBypass === false
    || safety.autoWidthReduction === false
  )) {
    warnings.push('Safety-Guard: Side-Low-Cut, Kick-Transient-Bypass und Auto-Width-Reduction sollten aktiv sein.');
  }
  if (mode !== 'off' && (safety.subMono === false || safety.correlationMonitor === false)) {
    warnings.push('Safety-Guard: Sub-Mono und Correlation Monitor sollten für Haas-Processing aktiv sein.');
  }
  return warnings;
}

function findProductionConflicts({
  model = 'v6',
  weirdness = 0,
  moods = [],
  sonic = [],
  bpm = 0,
  subgenre = '',
  mix = ''
} = {}) {
  const moodSet = new Set(moods.map(value => cleanText(value).toLowerCase()));
  const sonicSet = new Set(sonic.map(value => cleanText(value).toLowerCase()));
  const hasBassTag = expression => [...sonicSet].some(tag => expression.test(tag));
  const issues = [];

  const normalizedModel = normalizeModelName(model);

  if (normalizedModel === 'v6-wild-pro-custom' && weirdness > 80 && moodSet.has('meditative')) {
    issues.push('High v6-wild mutation conflicts with a calm meditative target.');
  }
  if (normalizedModel === 'v6-wild-pro-custom' && weirdness > 75 && sonicSet.size < 2) {
    issues.push('High wildness needs at least two concrete sonic anchors.');
  }
  if (Number(bpm) > 155 && cleanText(subgenre).toLowerCase() === 'zenonesque') {
    issues.push('Zenonesque target is unusual at this BPM; verify intent.');
  }
  if (cleanText(mix).toLowerCase().includes('low-end')
    && hasBassTag(/808/)
    && hasBassTag(/acid.*bass|bass.*acid/)) {
    issues.push('Potential low-end collision: choose a primary bass identity.');
  }
  return issues;
}

const PRODUCTION_CALC = {
  WILD_MUTATION_POOL,
  HAAS_TARGET_GUIDES,
  MOTOR_PRESETS,
  MOTOR_SAFETY_DEFAULTS,
  FX_MOTION_DEFAULTS,
  FX_MOTION_FAMILIES,
  FX_EFFECT_FAMILIES,
  FX_SUBGENRE_PROFILES,
  FX_PHASE_PROFILES,
  SEMANTIC_DICTIONARY,
  CAUSAL_RULES,
  buildMotorStyleTag,
  buildMotorStudioBrief,
  auditMotorSettings,
  buildFxMotionTag,
  buildFxMotionPlan,
  buildFxMotionBrief,
  auditFxMotionSettings,
  evaluateCausalRules,
  buildSemanticInterpretation,
  findSemanticConflicts,
  buildProductionEvidenceState,
  formatProductionEvidence,
  buildWildDirective,
  buildModelDirective,
  buildSunoWebResearchBrief,
  buildStylePrompt,
  buildSourceRequest,
  buildStudioBrief,
  buildEffectBrief,
  buildPsychoStyleTag,
  buildPsychoStudioBrief,
  buildHaasBrief,
  buildTrackHaasGuide,
  auditPsychoSettings,
  findProductionConflicts
};

if (typeof module !== 'undefined' && module.exports) module.exports = PRODUCTION_CALC;
if (typeof window !== 'undefined') window.PRODUCTION_CALC = PRODUCTION_CALC;
