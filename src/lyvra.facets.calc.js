'use strict';

const STUDIO_TIMELINE = [
  { from: '0:00', to: '0:40', name: 'DJ intro', role: 'Establish origin and mixable entry.', low: 'Introduce kick/sub in a stable grid.', mid: 'Keep metallic rhythm sparse.', high: 'Place a distant signal fragment.' },
  { from: '0:40', to: '1:35', name: 'motor lock', role: 'Make the movement unmistakable.', low: 'Lock dry kick and straight 16th mono psybass.', mid: 'Let acid announce itself without displacing the motor.', high: 'Narrow the perceived space.' },
  { from: '1:35', to: '2:25', name: 'build', role: 'Increase pressure without destabilizing the foundation.', low: 'Keep the motor unbroken.', mid: 'Densify the FM/303 dialogue.', high: 'Increase focus and use one short voice cue if intended.' },
  { from: '2:25', to: '3:10', name: 'impact', role: 'Deliver controlled impact.', low: 'Full low-end with a clear drop grid.', mid: 'Let percussion answer the drop.', high: 'Use selective spectral throws.' },
  { from: '3:10', to: '4:00', name: 'identity', role: 'State the track identity.', low: 'Preserve motor identity.', mid: 'Mutate the motif.', high: 'Create spatial illusion without replacing the motor.' },
  { from: '4:00', to: '4:55', name: 'reset', role: 'Create a causal pressure release, not a full erasure.', low: 'Thin the low layers but retain a pulse where useful.', mid: 'Dismantle the acid phrase.', high: 'Leave space for meaning or a spoken mantra.' },
  { from: '4:55', to: '5:50', name: 'rebuild', role: 'Make the return feel earned.', low: 'Restore bass and low-end deliberately.', mid: 'Recompose the mutation.', high: 'Reintroduce depth and tension.' },
  { from: '5:50', to: '6:45', name: 'second pressure', role: 'Scale the second pressure arc.', low: 'Restore full kinetic authority.', mid: 'Scale the acid/FM conversation.', high: 'Increase psychoacoustic motion.' },
  { from: '6:45', to: '7:40', name: 'psy peak', role: 'Reach the main peak without losing physical ground.', low: 'Keep kick and sub coherent.', mid: 'Make the freakout functional.', high: 'Escalate perception; use silence only with intent.' },
  { from: '7:40', to: '8:40', name: 'transformed peak', role: 'Transform the peak rather than merely repeat it.', low: 'Keep LOW grounded.', mid: 'Transform the established motif.', high: 'Recall the final hook/mantra.' },
  { from: '8:40', to: '9:20', name: 'landing', role: 'Prepare a controlled exit.', low: 'Move toward the DJ outro.', mid: 'Withdraw selected acid layers.', high: 'End voice cues.' },
  { from: '9:20', to: '10:00', name: 'DJ outro', role: 'Land completely and remain mixable.', low: 'Reduce to a DJ-mixable low-end and controlled exit.', mid: 'Withdraw MID elements.', high: 'No unexpected re-entry.' }
];

const RESEARCH_QUERIES = {
  track: {
    preaudit: {
      official: 'site:help.suno.com/en/articles Suno v6 model style lyrics limits duration controls official help 2026',
      community: 'site:reddit.com/r/SunoAI OR site:reddit.com/r/Suno v6 psytrance prompts style lyrics BPM community experience 2026'
    },
    renderer: {
      official: 'site:help.suno.com Suno v6 Style Extended Lyrics title fields prompting limits official current',
      community: 'site:reddit.com/r/SunoAI OR site:reddit.com/r/Suno v6 prompt interpretation emojis section tags style lyrics community 2026'
    }
  },
  studio2: {
    preaudit: {
      official: 'site:help.suno.com/en/articles Suno v6 maximum generation duration 8 minutes Extend official OR site:suno.com/release-notes/studio-2 Studio 2 timeline stems FX 2026',
      community: 'site:reddit.com/r/SunoAI OR site:reddit.com/r/Suno Studio 2 timeline extend stems FX experience 2026'
    },
    renderer: {
      official: 'site:suno.com/release-notes/studio-2 Suno Studio 2 timeline operations stems effects official OR site:help.suno.com Extend whole song',
      community: 'site:reddit.com/r/SunoAI OR site:reddit.com/r/Suno Studio 2 preserve sections replace stems FX timeline operations 2026'
    }
  },
  speech: {
    preaudit: {
      official: 'site:suno.com/blog/introducing-speech-beta Suno Speech Beta script tone voice background music variety official 2026',
      community: 'site:reddit.com/r/SunoAI OR site:reddit.com/r/Suno Suno Speech Beta pronunciation voice background music experience 2026'
    },
    renderer: {
      official: 'site:suno.com/blog/introducing-speech-beta Suno Speech Beta script tone voice pronunciation official',
      community: 'site:reddit.com/r/SunoAI OR site:reddit.com/r/Suno Suno Speech Beta word fidelity prosody script renderer behavior 2026'
    }
  }
};

const FIELD_LIMITS = { title: 80, extended: 1000, style: 1000, lyrics: 5000 };

function valueOr(value, fallback) {
  const result = String(value ?? '').trim();
  return result || fallback;
}

function limitText(value, limit) {
  const text = String(value ?? '').trim();
  if (text.length <= limit) return text;
  const candidate = text.slice(0, limit + 1);
  const boundary = candidate.lastIndexOf(' ');
  return candidate.slice(0, boundary > limit * 0.75 ? boundary : limit).trimEnd();
}

function buildTrackDesignModel(input = {}) {
  const controls = {
    motorDNA: valueOr(input.motorDNA, 'Dry short 4x4 kick, straight rolling 16th-note mono psybass, pressure persistence and forward propulsion'),
    low: valueOr(input.low, 'Trustworthy physical authority: dry kick, straight rolling mono bass, mono sub and stable grid'),
    mid: valueOr(input.mid, 'Structured transformation: partly motor-bound, partly autonomous acid/FM dialogue, psy percussion and pattern mutation'),
    high: valueOr(input.high, 'Perceptual freedom and spectral space; it must not replace the motor'),
    pressure: valueOr(input.pressure, 'Sustain forward drive, shape attack and release, and make drops and transitions serve the motor'),
    psychoacousticDramaturgy: valueOr(input.psychoacousticDramaturgy, 'Create tension, contrast, release and return through controlled spectral and spatial motion'),
    globalMeaning: valueOr(input.globalMeaning, 'A signal becomes a shared point of orientation'),
    key: valueOr(input.key, ''),
    scale: valueOr(input.scale, ''),
    targetListener: valueOr(input.targetListener, 'A listener moving through a dark, focused dancefloor journey'),
    sceneContext: valueOr(input.sceneContext, 'Night-time club set with room for tension and release'),
    emotionalTemperature: valueOr(input.emotionalTemperature, 'Restless anticipation transforming into grounded belonging'),
    startingState: valueOr(input.startingState, 'Isolation and uncertainty'),
    storyCause: valueOr(input.storyCause, 'Pressure and uncertainty lead the listener to seek a stable signal'),
    reactionDecision: valueOr(input.reactionDecision, 'Choose to follow the signal rather than escape the pressure'),
    relationshipShift: valueOr(input.relationshipShift, 'The signal changes from distant warning into shared orientation'),
    consequence: valueOr(input.consequence, 'The listener becomes part of the pulse that once guided them'),
    voiceRole: valueOr(input.voiceRole, 'A restrained call answered by the instrumental arrangement'),
    breathAndPhrasing: valueOr(input.breathAndPhrasing, 'Leave breath between short phrases; let the kick and bass answer'),
    syllabicRhythm: valueOr(input.syllabicRhythm, 'Short, clear phrases with space for the motor and instrumental replies'),
    hookMantra: valueOr(input.hookMantra, 'Follow the signal'),
    mantraFunction: valueOr(input.mantraFunction, 'Return as a recognition anchor, changing from invitation to belonging'),
    callResponse: valueOr(input.callResponse, 'Voice calls; acid/FM midrange answers; kick and bass remain the ground'),
    lyricFormat: valueOr(input.lyricFormat, 'Use square brackets for section labels and parentheses for performance directions'),
    emojiMeaning: valueOr(input.emojiMeaning, ''),
    emojiPlacement: valueOr(input.emojiPlacement, 'Only at a field or section where it clarifies intent'),
    emojiIntensity: valueOr(input.emojiIntensity, 'Subtle and sparse when semantically justified'),
    emojiFunction: valueOr(input.emojiFunction, 'Reinforce meaning; do not imply an acoustic effect')
  };
  const creatorControls = {
    rendererModel: valueOr(input.model, 'Context-dependent; not selected'),
    majorOption: valueOr(input.majorOption, 'Choose in current renderer UI'),
    maxMode: valueOr(input.maxMode, 'Choose in current renderer UI'),
    weirdness: input.weirdness === '' || input.weirdness == null ? null : Number(input.weirdness),
    variety: input.variety === '' || input.variety == null ? null : Number(input.variety),
    influence: input.influence === '' || input.influence == null ? null : Number(input.influence),
    voice: valueOr(input.voice, 'Choose in current renderer UI'),
    instrumental: input.instrumental === true,
    audioInfluence: input.audioInfluence === '' || input.audioInfluence == null ? null : Number(input.audioInfluence),
    audioConditioning: valueOr(input.audioConditioning, 'None')
  };
  const corePrompt = valueOr(input.corePrompt, 'Dark Psy psytrance, 148 BPM, rolling bass, mono-safe low-end');
  const styleSeed = [
    input.bpm ? `${input.bpm} BPM` : '',
    input.key,
    input.scale ? `Scale: ${input.scale}` : '',
    valueOr(input.genreDNA, corePrompt),
    `Motor: ${controls.motorDNA}`,
    `Energy arc: ${controls.pressure}`,
    `LOW: ${controls.low}`,
    `MID: ${controls.mid}`,
    `HIGH: ${controls.high}`,
    `Critical boundaries: keep motor propulsion coherent; no bouncy low-end or uncontrolled tempo drift`,
    controls.emojiMeaning ? `Meaning-bound emoji intent: ${controls.emojiMeaning} (${controls.emojiPlacement}; ${controls.emojiIntensity})` : ''
  ].filter(Boolean).join('; ');
  const fields = {
    title: limitText(valueOr(input.title, 'Signal / Pressure / Return'), FIELD_LIMITS.title),
    extended: limitText(valueOr(input.extended, `Intent: ${controls.globalMeaning}. Audience/context: ${controls.targetListener}; ${controls.sceneContext}. Emotional temperature: ${controls.emotionalTemperature}. Causal arc: ${controls.startingState} -> trigger: ${controls.storyCause} -> reaction/decision: ${controls.reactionDecision} -> relationship shift: ${controls.relationshipShift} -> consequence: ${controls.consequence}. ${controls.psychoacousticDramaturgy}`), FIELD_LIMITS.extended),
    style: limitText(valueOr(input.style, styleSeed), FIELD_LIMITS.style),
    lyrics: limitText(valueOr(input.lyrics, `[Intro]\n(${controls.breathAndPhrasing})\n\n[Build]\n${controls.startingState}\n${controls.storyCause}\n\n[Decision]\n${controls.reactionDecision}\n\n[Call and response]\n${controls.voiceRole}\n(${controls.callResponse})\n\n[Hook / mantra]\n${controls.hookMantra}\n(${controls.mantraFunction})\n\n[Transformed return]\n${controls.relationshipShift}\n${controls.consequence}\n\n[Outro]\n(${controls.globalMeaning})`), FIELD_LIMITS.lyrics)
  };
  const emojiBinding = controls.emojiMeaning
    ? `Meaning: ${controls.emojiMeaning}; placement: ${controls.emojiPlacement}; qualitative intensity: ${controls.emojiIntensity}; function: ${controls.emojiFunction}. Resolve meaning, then intensity, then translate to renderer. Omission is valid; quantity and weighting are not fixed.`
    : 'No emoji is justified by the current meaning. Omission is valid; quantity and weighting are not fixed.';
  const creatorBrief = [
    `MOTOR (primary kinetic reference, highest Track influence but not total composition authority): ${controls.motorDNA}.`,
    `LOW (${controls.low}).`,
    `MID (${controls.mid}). The 50/50 rule is a heuristic for motor binding versus autonomous mutation, never a numeric mix.`,
    `HIGH (${controls.high}).`,
    `Pressure and motion: ${controls.pressure}.`,
    `Psychoacoustic dramaturgy: ${controls.psychoacousticDramaturgy}.`,
    `Lyrics and whole-track atmosphere: audience ${controls.targetListener}; context ${controls.sceneContext}; temperature ${controls.emotionalTemperature}; global meaning "${controls.globalMeaning}"; ${controls.startingState} -> ${controls.storyCause} -> ${controls.reactionDecision} -> ${controls.relationshipShift} -> ${controls.consequence}. Voice role "${controls.voiceRole}"; breath/phrasing "${controls.breathAndPhrasing}"; syllabic rhythm "${controls.syllabicRhythm}"; hook/mantra "${controls.hookMantra}" (${controls.mantraFunction}); response "${controls.callResponse}"; ${controls.lyricFormat}.`,
    `Meaning-bound emoji: ${emojiBinding}`,
    `Separate Creator Controls (not renderer text or API parameters): model ${creatorControls.rendererModel}; major option ${creatorControls.majorOption}; Max ${creatorControls.maxMode}; Weirdness ${creatorControls.weirdness ?? 'unset'}; Variety ${creatorControls.variety ?? 'unset'}; Style Influence ${creatorControls.influence ?? 'unset'}; Voice ${creatorControls.voice}; Instrumental ${creatorControls.instrumental}; Audio Influence ${creatorControls.audioInfluence ?? 'unset'}; conditioning ${creatorControls.audioConditioning}.`
  ].join('\n');
  return { controls, creatorControls, creatorBrief, fields, fieldLimits: { ...FIELD_LIMITS }, modelChoices: ['v6', 'v6-wild', 'v6-mini', 'V6 Pro (account label)', 'V6 Wild Pro (account label)', 'V6 Mini (account label)', 'LYVRA STYLE', '666PoWeRSoUnD', '666SD_PsyTrance'] };
}

function parseTime(value) {
  const [minutes, seconds] = String(value).split(':').map(Number);
  return minutes * 60 + seconds;
}

function buildStudio2Plan(input = {}) {
  const preserve = valueOr(input.preserve, 'Protect motor identity, excellent sections, and the established intent');
  const mutate = valueOr(input.mutate, 'Mutate only selected arrangement surfaces, transitions and textures');
  const stems = Array.isArray(input.stems) && input.stems.length ? input.stems : ['Kick', 'Bass', 'Drums', 'Leads', 'Pads', 'FX'];
  const sections = STUDIO_TIMELINE.map(section => ({
    ...section,
    motor: valueOr(input.motorDNA, 'Preserve primary kinetic reference and forward propulsion'),
    lowLayer: section.low,
    midLayer: section.mid,
    highLayer: section.high,
    preserve,
    mutate,
    transition: valueOr(input.transition, 'Phrase-aware transition; preserve downbeat and motor continuity'),
    stems: [...stems],
    fx: valueOr(input.fx, 'Controlled FX automation; avoid masking kick, sub or the next section')
  }));
  return {
    durationMinutes: 10,
    singleGenerationMaximumMinutes: 8,
    generationControls: {
      intent: valueOr(input.intent, 'Motor-first psytrance journey with evolving pressure'),
      rendererModel: valueOr(input.rendererModel, 'Context-dependent; not selected'),
      majorOption: valueOr(input.majorOption, 'Choose in current renderer UI'),
      maxMode: valueOr(input.maxMode, 'Choose in current renderer UI'),
      variety: input.variety === '' || input.variety == null ? null : Number(input.variety),
      weirdness: input.weirdness === '' || input.weirdness == null ? null : Number(input.weirdness),
      influence: input.influence === '' || input.influence == null ? null : Number(input.influence),
      voice: valueOr(input.voice, 'Choose in current renderer UI'),
      instrumental: input.instrumental === true,
      audioInfluence: input.audioInfluence === '' || input.audioInfluence == null ? null : Number(input.audioInfluence),
      audioConditioning: valueOr(input.conditioning, 'None'),
      seedDuration: valueOr(input.duration, 'Under 8 minutes')
    },
    workflow: [
      'Create a seed under eight minutes.',
      'Extend the selected continuation.',
      'Arrange the result against the 12-section Studio timeline.',
      'Protect the motor and excellent sections while editing.',
      'Inspect whole-song loudness.',
      'Create a controlled DJ outro with no re-entry.',
      'Validate the rendered audio by listening; no audio is analyzed here.'
    ],
    operationControls: {
      task: valueOr(input.task, 'Choose Studio operation'),
      surface: valueOr(input.surface, 'Choose current Studio surface'),
      editScope: valueOr(input.editScope, 'Choose edit scope'),
      controls: valueOr(input.controls, 'No operation-specific controls recorded'),
      specialistOperation: valueOr(input.specialistOperation, 'Choose specialist operation'),
      observation: valueOr(input.observation, 'No manual observation recorded'),
      evidenceStatus: valueOr(input.evidenceStatus, 'UNVERIFIED')
    },
    sections
  };
}

function buildSpeechDesign(input = {}) {
  const mode = input.mode === 'advanced' ? 'advanced' : 'simple';
  if (mode === 'simple') return {
    mode,
    releaseStatus: 'Development candidate; not a released LYVRA production facet.',
    brief: valueOr(input.freeform, 'Describe the intended speech in your own words.'),
    spokenEmoji: false,
    actualTimecodedWordReviewPassed: false
  };
  const phonemeTests = {
    sourceScriptVersion: valueOr(input.sourceScriptVersion, ''),
    audioReferenceSha: valueOr(input.audioReferenceSha, ''),
    specificWord: valueOr(input.specificWord, ''),
    actualTimecode: valueOr(input.actualTimecode, ''),
    originalPronunciation: valueOr(input.originalPronunciation, ''),
    candidatePronunciation: valueOr(input.candidatePronunciation, ''),
    heardObservation: valueOr(input.heardObservation, ''),
    creatorApproval: input.creatorApproval === true
  };
  const audioHashIsValid = /^[a-f\d]{64}$/i.test(phonemeTests.audioReferenceSha);
  const timecodeIsValid = /^\d{1,2}:\d{2}(?:\.\d{1,3})?$/.test(phonemeTests.actualTimecode);
  const requiredEvidence = Object.entries(phonemeTests)
    .filter(([key]) => key !== 'creatorApproval')
    .every(([, value]) => Boolean(value));
  return {
    mode,
    releaseStatus: 'Development candidate; not a released LYVRA production facet.',
    script: valueOr(input.script, ''),
    tone: valueOr(input.tone, 'Warm, clear, emotionally grounded'),
    voiceSex: valueOr(input.voiceSex, 'Not selected; use current Speech UI'),
    backgroundMusic: valueOr(input.backgroundMusic, 'Not selected; use current Speech UI'),
    variety: input.variety === '' || input.variety == null ? 'Not selected; use current Speech UI' : String(input.variety),
    prosody: valueOr(input.prosody, 'Natural stress, phrasing and pauses'),
    wordFidelity: valueOr(input.wordFidelity, 'Preserve the script literally; do not paraphrase'),
    phonemeTests,
    phonemeCandidateStatus: requiredEvidence && audioHashIsValid && timecodeIsValid && phonemeTests.creatorApproval
      ? 'Candidate evidence fields captured; this app does not assert a passed listening review.'
      : 'Incomplete candidate evidence; an actual timecoded word review has not passed.',
    actualTimecodedWordReviewPassed: false,
    spokenEmoji: false
  };
}

function buildSpeechDesignBrief(input = {}) {
  const design = buildSpeechDesign(input);
  const lines = [
    `LYVRA SPEECH DESIGN (${design.mode.toUpperCase()})`,
    design.releaseStatus,
    `Script / brief: ${design.brief || design.script}`
  ];
  if (design.mode === 'advanced') {
    lines.push(
      `Tone: ${design.tone}. Voice: ${design.voiceSex}. Background music: ${design.backgroundMusic}.`,
      `Variety: ${design.variety}. Prosody: ${design.prosody}. Word fidelity: ${design.wordFidelity}.`,
      'Spoken words first; literal emoji in spoken text is off by default.',
      `Phoneme candidate evidence: ${JSON.stringify(design.phonemeTests)}`,
      `Phoneme review status: ${design.phonemeCandidateStatus} Actual timecoded word review passed: ${design.actualTimecodedWordReviewPassed}.`
    );
  }
  return lines.join('\n');
}

function createResearchSearchUrl(facet, phase, sourceClass = 'official') {
  const query = RESEARCH_QUERIES[facet]?.[phase]?.[sourceClass];
  if (!query) throw new Error('Unknown facet, research phase, or source class.');
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function buildEvidenceRecord(input = {}) {
  const now = input.checkedAt || new Date().toISOString();
  return {
    id: input.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    facet: input.facet || 'track',
    phase: input.phase || 'preaudit',
    question: input.question || '',
    model: input.model || '',
    studioVersionOrMode: input.studioVersionOrMode || '',
    sourceClass: input.sourceClass || 'current_official',
    url: input.url || '',
    sourceDate: input.sourceDate || '',
    checkedAt: now,
    claim: input.claim || '',
    observation: input.observation || '',
    interpretation: input.interpretation || '',
    contradictions: input.contradictions || '',
    confidence: input.confidence || 'unrated',
    generalizationLimit: input.generalizationLimit || '',
    testCandidate: input.testCandidate || '',
    status: input.status || 'manual_review'
  };
}

const api = {
  STUDIO_TIMELINE,
  FIELD_LIMITS,
  RESEARCH_QUERIES,
  buildTrackDesignModel,
  buildStudio2Plan,
  buildSpeechDesign,
  buildSpeechDesignBrief,
  createResearchSearchUrl,
  buildEvidenceRecord,
  parseTime
};

if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.LYVRA_FACETS_CALC = api;
