/* ============================================================
   666 SOUNDS DESIGN — lyric.templates.js
   Subgenre-spezifische Lyrik-Templates + Suno Section-Tag-System
   
   ARCHITEKTUR-PRINZIP:
   Die Lyrik steuert den Track — sie ist kein Decoration-Text.
   Suno interpretiert [Section]-Tags als Arrangement-Anweisungen:
   - [Intro] → ruhiger Aufbau, wenige Elemente
   - [Build] → Spannung steigt, mehr Layer
   - [Drop]  → voller Sound, maximale Energie
   - [Break] → Breakdown, stripped back
   - [Peak]  → höchste Energie im Track
   - [Outro] → Auflösung
   
   Lyrik-Direktiven (in Klammern) steuern weitere Parameter:
   (low energy), (building tension), (psychedelic), (ritualistic)
   ============================================================ */

'use strict';

// ============================================================
// SECTION TAG LIBRARY
// ============================================================

const SECTION_TAGS = {
  intro:     { tag: '[Intro]',     energy: 'low',     directive: '(atmospheric, low energy, sparse)' },
  ambient:   { tag: '[Ambient]',   energy: 'low',     directive: '(floating, meditative, formless)' },
  build:     { tag: '[Build]',     energy: 'medium',  directive: '(building tension, rising energy)' },
  prebuild:  { tag: '[Pre-Drop]',  energy: 'medium',  directive: '(intense anticipation, maximum tension)' },
  drop:      { tag: '[Drop]',      energy: 'high',    directive: '(full energy release, maximum impact)' },
  breakdown: { tag: '[Break]',     energy: 'low',     directive: '(stripped back, hypnotic space)' },
  peak:      { tag: '[Peak]',      energy: 'extreme', directive: '(peak intensity, all elements, overwhelming)' },
  groove:    { tag: '[Groove]',    energy: 'medium',  directive: '(locked groove, hypnotic repetition)' },
  ritual:    { tag: '[Ritual]',    energy: 'medium',  directive: '(ritualistic, ceremonial, repetitive)' },
  vision:    { tag: '[Vision]',    energy: 'low',     directive: '(psychedelic vision, inner journey)' },
  outro:     { tag: '[Outro]',     energy: 'low',     directive: '(dissolving, releasing, fading away)' },
  bridge:    { tag: '[Bridge]',    energy: 'medium',  directive: '(transitional, unexpected shift)' },
};

// ============================================================
// LYRIK-DIREKTIVEN (steuern Energie + Stimmung im Track)
// ============================================================

const DIRECTIVES = {
  energy: {
    low:     '(low energy, sparse, floating)',
    medium:  '(medium energy, building)',
    high:    '(high energy, driving, powerful)',
    extreme: '(extreme energy, overwhelming, intense)',
  },
  mood: {
    dark:       '(dark, ominous, unsettling)',
    euphoric:   '(euphoric, uplifting, transcendent)',
    hypnotic:   '(hypnotic, repetitive, trance-inducing)',
    cosmic:     '(cosmic, vast, infinite)',
    tribal:     '(tribal, primal, ancient)',
    psychedelic:'(psychedelic, hallucinogenic, reality-bending)',
    spiritual:  '(spiritual, sacred, devotional)',
    mechanical: '(mechanical, industrial, precise)',
  },
  texture: {
    minimal:    '(minimal, stripped back, space)',
    layered:    '(layered, complex, dense)',
    pulsing:    '(pulsing, rhythmic, throbbing)',
    swirling:   '(swirling, circular, spiraling)',
    crushing:   '(crushing, heavy, overwhelming)',
  }
};

// ============================================================
// SUBGENRE LYRIK-TEMPLATES
// ============================================================

const LYRIC_TEMPLATES = {

  dark: {
    name: 'Dark Psytrance',
    themes: ['ritual', 'void', 'shadow', 'abyss', 'darkness', 'fear', 'descent', 'chaos'],
    imageKeywords: ['dark', 'underground', 'ritual', 'shadow', 'glitch', 'demon', 'void'],
    sections: {
      standard: [
        { tag: 'intro',     lines: ['(darkness descends)', '(pulse begins in the void)'] },
        { tag: 'build',     lines: ['The shadow rises from below', 'Twisting through the fractured mind', '(tension building, chaotic energy)'] },
        { tag: 'drop',      lines: ['RELEASE THE DARK', 'Bass tears through the ritual', 'No escape from the spiral', '(maximum dark energy)'] },
        { tag: 'breakdown', lines: ['(hypnotic space, breathing)', 'The void expands', '(stripped back, eerie)'] },
        { tag: 'peak',      lines: ['BEYOND THE THRESHOLD', 'CHAOS ABSOLUTE', '(overwhelming dark peak)'] },
        { tag: 'outro',     lines: ['(darkness recedes)', '(returning to silence)'] },
      ],
      minimal: [
        { tag: 'intro',     lines: ['(void)'] },
        { tag: 'drop',      lines: ['DARKNESS', '(full force)', 'NO ESCAPE'] },
        { tag: 'breakdown', lines: ['(emptiness)'] },
        { tag: 'peak',      lines: ['CHAOS', '(absolute)'] },
        { tag: 'outro',     lines: ['(silence)'] },
      ]
    },
    systemPrompt: `You are writing psytrance lyrics for Dark Psytrance music (148-155 BPM).
Dark psytrance lyrics use [Section] tags to control track energy and arrangement.
Themes: void, ritual, darkness, chaos, descent, shadow, abyss, fear.
Style: short, powerful lines. Use Suno section tags [Intro], [Build], [Drop], [Break], [Peak], [Outro].
Add energy directives in parentheses like (low energy), (building tension), (maximum dark energy).
Lyrics DRIVE the track energy — use capitalization for high-energy moments.
Keep total lyrics under 400 words. Make the sections clearly control energy flow.`
  },

  forest: {
    name: 'Forest Psytrance',
    themes: ['nature', 'mushroom', 'roots', 'ancient forest', 'bioluminescence', 'earth', 'tribal', 'shaman'],
    imageKeywords: ['forest', 'mushroom', 'nature', 'tribal', 'bioluminescent', 'roots', 'ancient'],
    sections: {
      standard: [
        { tag: 'intro',     lines: ['(forest awakens)', '(ancient roots stir)', '(low energy, organic)'] },
        { tag: 'build',     lines: ['Roots spread beneath the earth', 'Ancient pulse begins to breathe', 'The forest remembers', '(building organic tension)'] },
        { tag: 'drop',      lines: ['THE FOREST ERUPTS', 'Ancient twisted energy', 'Roots tear through the floor', '(full forest energy, tribal)'] },
        { tag: 'ritual',    lines: ['Shaman calls the ancient ones', 'Fire and earth and twisted bass', '(ritualistic, tribal, medium energy)'] },
        { tag: 'breakdown', lines: ['(forest breathing)', 'Mycorrhizal network pulses', '(organic, minimal, hypnotic)'] },
        { tag: 'peak',      lines: ['ALL ROOTS CONNECT', 'ANCIENT POWER UNLEASHED', '(maximum forest peak, tribal overwhelming)'] },
        { tag: 'outro',     lines: ['(forest returns to silence)', '(roots settle)', '(low energy, organic fade)'] },
      ]
    },
    systemPrompt: `You are writing psytrance lyrics for Forest Psytrance music (148-155 BPM).
Forest psytrance is organic, tribal, shamanic. Themes: ancient forests, mushrooms, roots, earth energy, shamanic ritual, bioluminescence.
Use [Section] tags: [Intro], [Build], [Drop], [Ritual], [Break], [Peak], [Outro].
Add energy directives: (low energy, organic), (tribal energy), (shamanic ritual), (forest eruption).
Lines should feel ancient, primal, organic. Mix English with abstract nature sounds.
Keep total under 400 words. Energy flow is crucial — lyrics control the arrangement.`
  },

  'full-on': {
    name: 'Full-On Psytrance',
    themes: ['euphoria', 'festival', 'energy', 'transcendence', 'unity', 'dance', 'light', 'ascension'],
    imageKeywords: ['festival', 'lights', 'euphoric', 'neon', 'crowd', 'laser', 'energy'],
    sections: {
      standard: [
        { tag: 'intro',     lines: ['(festival energy awakens)', '(first light appears)', '(low energy, anticipation)'] },
        { tag: 'build',     lines: ['Feel the energy rising high', 'Thousand hands reach for the sky', '(building euphoric tension)'] },
        { tag: 'drop',      lines: ['EUPHORIA UNLEASHED', 'We are the music we are the light', 'Dance beyond the edge of night', '(full-on festival peak energy)'] },
        { tag: 'build',     lines: ['Push it further push it higher', 'Every soul becomes the fire', '(second build, more intense)'] },
        { tag: 'drop',      lines: ['FESTIVAL ENERGY MAXIMUM', 'UNITY IN THE SOUND', '(overwhelming euphoric drop)'] },
        { tag: 'breakdown', lines: ['(breathing space)', 'Float above the crowd', '(euphoric calm)'] },
        { tag: 'peak',      lines: ['TRANSCENDENCE NOW', 'BEYOND ALL LIMITS', '(absolute euphoric peak)'] },
        { tag: 'outro',     lines: ['(gentle return)', '(festival fades to dawn)'] },
      ]
    },
    systemPrompt: `You are writing psytrance lyrics for Full-On Psytrance music (143-147 BPM).
Full-On psytrance is euphoric, festival energy, transcendent, unifying. Themes: euphoria, transcendence, dance, light, unity, festival, energy.
Use [Section] tags: [Intro], [Build], [Drop], [Break], [Peak], [Outro].
Energy directives: (low energy, anticipation), (building euphoric tension), (full festival energy), (maximum transcendence).
Lyrics are uplifting, positive, energy-focused. Use capitalization at peaks.
Keep total under 400 words. Make energy arc clear through the lyrics.`
  },

  progressive: {
    name: 'Progressive Psytrance',
    themes: ['journey', 'depth', 'hypnosis', 'water', 'space', 'time', 'consciousness', 'flow'],
    imageKeywords: ['deep', 'cosmic', 'hypnotic', 'progressive', 'flowing', 'geometric', 'space'],
    sections: {
      standard: [
        { tag: 'intro',     lines: ['(deep space begins)', '(minimal groove establishes)', '(very low energy, patient)'] },
        { tag: 'groove',    lines: ['The groove pulls you deeper', 'Layers fold into layers', '(hypnotic, medium energy, rolling)'] },
        { tag: 'build',     lines: ['Time dissolves in the groove', 'Consciousness unfolds slowly', '(slow build, subtle tension)'] },
        { tag: 'drop',      lines: ['Deep roll takes over', 'Hypnotic lock complete', 'The journey begins in full', '(progressive drop, not explosive — hypnotic)'] },
        { tag: 'breakdown', lines: ['(stripped to pure groove)', '(deep minimal space)', 'Just the pulse remains', '(hypnotic minimal)'] },
        { tag: 'peak',      lines: ['DEEP HYPNOTIC PEAK', 'ALL LAYERS ALIGNED', '(full progressive power, not chaotic — precise)'] },
        { tag: 'outro',     lines: ['(groove slowly dissolves)', '(returning from the journey)', '(fade to silence)'] },
      ]
    },
    systemPrompt: `You are writing psytrance lyrics for Progressive Psytrance music (138-143 BPM).
Progressive psytrance is deep, hypnotic, journey-based. Themes: consciousness, depth, hypnosis, flow, time dissolution, inner journey, space.
Use [Section] tags: [Intro], [Groove], [Build], [Drop], [Break], [Peak], [Outro].
Energy directives: (very low energy, patient), (hypnotic rolling groove), (subtle building tension), (deep progressive drop).
Progressive lyrics are subtle, poetic, internal. No shouting. Lowercase at low energy, capitalize peaks.
Keep total under 400 words. The arc is slow and deep, not explosive.`
  },

  goa: {
    name: 'Goa Trance',
    themes: ['cosmos', 'spirit', 'sunrise', 'ancient India', 'sacred geometry', 'consciousness', 'universe', 'divine'],
    imageKeywords: ['goa', 'sunrise', 'cosmic', 'mandala', 'spiritual', 'sacred', 'India', 'temple'],
    sections: {
      standard: [
        { tag: 'intro',     lines: ['(cosmic dawn begins)', '(ancient melodies emerge)', '(spiritual awakening, low energy)'] },
        { tag: 'build',     lines: ['Sacred geometry unfolds', 'Ancient melodies from distant shores', 'The cosmos breathes through the sound', '(melodic building, spiritual energy)'] },
        { tag: 'drop',      lines: ['COSMIC SUNRISE UNLEASHED', 'Sacred acid spirals rise', 'Ancient and future become one', '(full goa energy, melodic euphoria)'] },
        { tag: 'vision',    lines: ['Geometric visions cascade', 'Consciousness expands beyond form', '(psychedelic vision, medium energy)'] },
        { tag: 'breakdown', lines: ['(sacred space)', 'The universe breathes', '(spiritual calm)'] },
        { tag: 'peak',      lines: ['COSMIC UNITY', 'ALL IS ONE', 'THE UNIVERSE DANCES', '(goa peak, spiritual euphoria)'] },
        { tag: 'outro',     lines: ['(sacred geometry dissolves)', '(return to earth from cosmos)', '(spiritual completion)'] },
      ]
    },
    systemPrompt: `You are writing psytrance lyrics for Goa Trance music (140-148 BPM).
Goa trance is spiritual, cosmic, melodic. Themes: cosmos, sacred geometry, spiritual awakening, ancient India, sunrise, consciousness expansion, divine unity.
Use [Section] tags: [Intro], [Build], [Drop], [Vision], [Break], [Peak], [Outro].
Energy directives: (spiritual awakening, low energy), (melodic building), (cosmic euphoria), (psychedelic vision).
Lyrics feel ancient, mystical, spiritual. Mix cosmic imagery with spiritual concepts.
Keep total under 400 words. Energy should feel like a spiritual journey to euphoria.`
  },

  'hi-tech': {
    name: 'Hi-Tech Psytrance',
    themes: ['machine', 'cyber', 'speed', 'industrial', 'binary', 'override', 'system', 'digital'],
    imageKeywords: ['cyber', 'machine', 'industrial', 'digital', 'circuit', 'override', 'neon', 'tech'],
    sections: {
      standard: [
        { tag: 'intro',     lines: ['(system initializing)', '(machine awakens)', '(cold boot sequence)'] },
        { tag: 'build',     lines: ['SYSTEM: LOADING', 'OVERRIDE INITIATED', 'MAXIMUM SPEED APPROACHING', '(industrial build, mechanical precision)'] },
        { tag: 'drop',      lines: ['SYSTEM OVERRIDE', 'MAXIMUM VELOCITY', 'MACHINE ABSOLUTE', '(extreme speed, industrial peak)'] },
        { tag: 'breakdown', lines: ['(system pause)', 'PROCESSING', '(cold mechanical silence)'] },
        { tag: 'peak',      lines: ['OVERLOAD', 'SYSTEM FAILURE', 'BEAUTIFUL CHAOS', '(extreme hi-tech peak, overwhelming speed)'] },
        { tag: 'outro',     lines: ['(system shutdown)', '(power down sequence)', '(silence)'] },
      ]
    },
    systemPrompt: `You are writing psytrance lyrics for Hi-Tech Psytrance music (155-165 BPM).
Hi-Tech psytrance is mechanical, industrial, extreme speed, cyberpunk. Themes: machines, systems, override, speed, digital chaos, industrial precision.
Use [Section] tags: [Intro], [Build], [Drop], [Break], [Peak], [Outro].
Energy directives: (cold boot), (mechanical precision), (extreme speed), (industrial overload), (system failure).
Lyrics are short, mechanical, CAPITALIZED for high energy. System/computer language. Minimal words, maximum impact.
Keep total under 300 words. It's a machine — efficient, brutal, fast.`
  },

  zenonesque: {
    name: 'Zenonesque',
    themes: ['inner space', 'consciousness', 'silence', 'depth', 'dissolving', 'awareness', 'void', 'presence'],
    imageKeywords: ['deep', 'minimal', 'consciousness', 'inner', 'silence', 'fractal', 'void', 'meditative'],
    sections: {
      standard: [
        { tag: 'intro',     lines: ['(silence before sound)', '(presence emerging)', '(deepest low energy)'] },
        { tag: 'groove',    lines: ['awareness without object', 'the groove is the only truth', '(deep meditative groove)'] },
        { tag: 'vision',    lines: ['layers of consciousness peel away', 'what remains is only this', '(inner vision, minimal)'] },
        { tag: 'drop',      lines: ['deep pull inward', 'the sound becomes the self', 'no separation', '(zenonesque drop — not explosive, deeply hypnotic)'] },
        { tag: 'breakdown', lines: ['(pure space)', '(just breathing)', '(absolute minimal)'] },
        { tag: 'peak',      lines: ['total presence', 'sound and silence as one', '(deep peak, not loud — vast)'] },
        { tag: 'outro',     lines: ['(dissolving back into silence)', '(consciousness rests)'] },
      ]
    },
    systemPrompt: `You are writing psytrance lyrics for Zenonesque / Deep Psytrance music (138-143 BPM).
Zenonesque is the deepest, most meditative form of psytrance. Themes: consciousness, inner space, awareness, silence, dissolution, presence, depth.
Use [Section] tags: [Intro], [Groove], [Vision], [Drop], [Break], [Peak], [Outro].
Energy directives: (deepest low energy), (meditative groove), (inner vision), (deep hypnotic pull), (vast but not loud peak).
Lyrics are minimal, lowercase preferred, poetic, philosophical. Zenonesque never shouts — it goes deeper.
Keep total under 300 words. Less is more. Space between words matters.`
  },

  suomi: {
    name: 'Suomi Psytrance',
    themes: ['nordic darkness', 'winter', 'raw power', 'aggression', 'cold', 'primal', 'underground', 'north'],
    imageKeywords: ['nordic', 'winter', 'dark', 'underground', 'raw', 'northern lights', 'ice', 'concrete'],
    sections: {
      standard: [
        { tag: 'intro',     lines: ['(nordic darkness)', '(cold concrete pulse)', '(low energy, raw)'] },
        { tag: 'build',     lines: ['From the frozen north it rises', 'Raw and uncompromising power', '(aggressive build)'] },
        { tag: 'drop',      lines: ['NORDIC AGGRESSION UNLEASHED', 'RAW UNDERGROUND POWER', 'NO MERCY', '(suomi drop, aggressive, raw)'] },
        { tag: 'breakdown', lines: ['(cold silence)', '(northern wind)', '(stripped back, raw)'] },
        { tag: 'peak',      lines: ['MAXIMUM AGGRESSION', 'NORTH TAKES ALL', '(suomi peak, overwhelming raw power)'] },
        { tag: 'outro',     lines: ['(cold returns)', '(fade to northern dark)'] },
      ]
    },
    systemPrompt: `You are writing psytrance lyrics for Suomi (Finnish) Psytrance music (148-155 BPM).
Suomi psytrance is raw, aggressive, underground, Nordic. Themes: Nordic darkness, winter, raw power, underground aggression, primal cold.
Use [Section] tags: [Intro], [Build], [Drop], [Break], [Peak], [Outro].
Energy directives: (cold raw energy), (nordic aggression), (underground power), (primal cold peak).
Lyrics are raw, direct, aggressive when needed. Mix raw energy with cold Nordic imagery.
Keep total under 350 words. Raw and uncompromising.`
  }
};

// ============================================================
// EXTENDED PROMPT TEMPLATES
// ============================================================

const EXTENDED_PROMPT_ELEMENTS = {
  arrangement: [
    'arrangement: intro-build-drop-breakdown-peak-outro structure',
    'arrangement: minimal intro expanding to full drop',
    'arrangement: slow progressive build over 4 minutes',
    'arrangement: multiple drops with increasing intensity',
  ],
  dynamics: [
    'dynamics: wide range from near-silence to crushing peaks',
    'dynamics: consistent driving energy throughout',
    'dynamics: slow builds with explosive releases',
    'dynamics: hypnotic flat energy with sudden peak moments',
  ],
  mixing: [
    'mixing: wide stereo field, deep sub bass, crisp highs',
    'mixing: mono-compatible bass, wide stereo atmosphere',
    'mixing: dry tight rhythm section, wet atmospheric leads',
    'mixing: massive low end, psychoacoustic stereo design',
  ],
  production: [
    'production: analog warmth with digital precision',
    'production: cold clinical digital sound design',
    'production: vintage acid machine character',
    'production: modern mastered festival-ready sound',
  ]
};

// ============================================================
// EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SECTION_TAGS,
    DIRECTIVES,
    LYRIC_TEMPLATES,
    EXTENDED_PROMPT_ELEMENTS
  };
} else {
  window.SECTION_TAGS = SECTION_TAGS;
  window.DIRECTIVES = DIRECTIVES;
  window.LYRIC_TEMPLATES = LYRIC_TEMPLATES;
  window.EXTENDED_PROMPT_ELEMENTS = EXTENDED_PROMPT_ELEMENTS;
}
