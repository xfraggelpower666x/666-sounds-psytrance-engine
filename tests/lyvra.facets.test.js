'use strict';

const {
  STUDIO_TIMELINE,
  FIELD_LIMITS,
  buildTrackDesignModel,
  buildStudio2Plan,
  buildSpeechDesign,
  buildSpeechDesignBrief,
  createResearchSearchUrl,
  buildEvidenceRecord,
  parseTime
} = require('../src/lyvra.facets.calc');

describe('LYVRA facet blueprint calculations', () => {
  test('track uses motor-first semantic layers and separates creator controls from renderer fields', () => {
    const result = buildTrackDesignModel({
      motorDNA: 'rolling mono psybass',
      low: 'mono sub',
      mid: 'acid/FM dialogue',
      high: 'orbital spectral space',
      scale: 'Phrygian',
      corePrompt: 'Dark Psy, 148 BPM'
    });

    expect(result.creatorBrief).toContain('primary kinetic reference');
    expect(result.creatorBrief).toContain('never a numeric mix');
    expect(result.creatorBrief).toContain('LOW (mono sub)');
    expect(result.creatorBrief).toContain('MID (acid/FM dialogue)');
    expect(result.creatorBrief).toContain('HIGH (orbital spectral space)');
    expect(result.fields.style).toContain('Dark Psy, 148 BPM; Motor: rolling mono psybass');
    expect(result.fields.style.indexOf('148 BPM')).toBeLessThan(result.fields.style.indexOf('Motor:'));
    expect(result.fields.style).toContain('Scale: Phrygian');
    expect(result.controls.key).toBe('');
    expect(result.modelChoices).toContain('666SD_PsyTrance');
  });

  test('renderer output fields enforce their individual observed limits', () => {
    const result = buildTrackDesignModel({
      title: 'T'.repeat(100),
      extended: 'E'.repeat(1200),
      style: 'S'.repeat(1200),
      lyrics: 'L'.repeat(6000)
    });

    for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
      expect(result.fields[field].length).toBeLessThanOrEqual(limit);
    }
  });

  test('track defaults remain useful and emoji guidance is meaning-bound when supplied', () => {
    const defaults = buildTrackDesignModel();
    const customized = buildTrackDesignModel({
      emojiMeaning: 'a signal finding its way home',
      emojiPlacement: 'after the hook',
      emojiIntensity: 'one clear accent',
      emojiFunction: 'mark the emotional return',
      title: `${'signal '.repeat(18)}return`
    });

    expect(defaults.creatorControls).toMatchObject({
      rendererModel: 'Context-dependent; not selected',
      majorOption: 'Choose in current renderer UI',
      variety: null,
      influence: null,
      audioConditioning: 'None'
    });
    expect(defaults.creatorBrief).toContain('No emoji is justified');
    expect(customized.creatorBrief).toContain('Meaning: a signal finding its way home');
    expect(customized.creatorBrief).toContain('placement: after the hook');
    expect(customized.fields.title.length).toBeLessThanOrEqual(FIELD_LIMITS.title);
    expect(customized.fields.title).not.toContain('return');
  });

  test('Studio 2 plan uses the exact twelve blueprint sections and honest ten-minute workflow', () => {
    const plan = buildStudio2Plan({
      preserve: 'protect motor',
      mutate: 'vary mids',
      rendererModel: 'v6-wild',
      variety: 48,
      influence: 81,
      stems: ['Kick', 'Bass']
    });

    expect(STUDIO_TIMELINE).toHaveLength(12);
    expect(plan.sections).toHaveLength(12);
    expect(plan.sections[0]).toMatchObject({ from: '0:00', to: '0:40', name: 'DJ intro', preserve: 'protect motor', mutate: 'vary mids' });
    expect(plan.sections[11]).toMatchObject({ from: '9:20', to: '10:00', name: 'DJ outro' });
    expect(parseTime(plan.sections[11].to)).toBe(600);
    expect(plan.singleGenerationMaximumMinutes).toBe(8);
    expect(plan.generationControls).toMatchObject({ rendererModel: 'v6-wild', variety: 48, influence: 81 });
    expect(plan.sections[0].stems).toEqual(['Kick', 'Bass']);
    expect(plan.sections[0]).toHaveProperty('lowLayer');
    expect(plan.sections[0]).toHaveProperty('midLayer');
    expect(plan.sections[0]).toHaveProperty('highLayer');
    expect(plan.workflow.join(' ')).toContain('seed under eight minutes');
    expect(plan.workflow.join(' ')).toContain('no audio is analyzed');
    const unconfiguredPlan = buildStudio2Plan();
    expect(unconfiguredPlan.sections[0].stems).toEqual(['Kick', 'Bass', 'Drums', 'Leads', 'Pads', 'FX']);
    expect(unconfiguredPlan.generationControls.rendererModel).toBe('Context-dependent; not selected');
    expect(unconfiguredPlan.operationControls.evidenceStatus).toBe('UNVERIFIED');
  });

  test('Speech simple and advanced modes preserve the development-only boundary', () => {
    const simple = buildSpeechDesign({ mode: 'simple', freeform: 'A quiet welcome' });
    const advanced = buildSpeechDesign({
      mode: 'advanced',
      script: 'Welcome to LYVRA',
      tone: 'calm',
      sourceScriptVersion: 'v1',
      audioReferenceSha: 'a'.repeat(64),
      specificWord: 'LYVRA',
      actualTimecode: '00:01.4',
      originalPronunciation: 'LIE-vra',
      candidatePronunciation: 'LEE-vra',
      heardObservation: 'The first syllable is clear.',
      creatorApproval: true
    });

    expect(simple.brief).toBe('A quiet welcome');
    expect(simple.releaseStatus).toContain('not a released');
    expect(simple.spokenEmoji).toBe(false);
    expect(advanced.phonemeTests.specificWord).toBe('LYVRA');
    expect(advanced.phonemeTests.creatorApproval).toBe(true);
    expect(advanced.actualTimecodedWordReviewPassed).toBe(false);
    expect(advanced.phonemeCandidateStatus).toContain('Candidate evidence fields captured');
    expect(buildSpeechDesign({ mode: 'advanced' }).phonemeCandidateStatus).toContain('Incomplete candidate evidence');
    expect(buildSpeechDesign({ mode: 'advanced', audioReferenceSha: 'not-a-sha', actualTimecode: '1:2', creatorApproval: true }).phonemeCandidateStatus).toContain('Incomplete candidate evidence');
    expect(buildSpeechDesignBrief({ mode: 'advanced', script: 'Hello' })).toContain('literal emoji in spoken text is off by default');
    expect(buildSpeechDesign().actualTimecodedWordReviewPassed).toBe(false);
  });

  test('six two-phase searches open official and community sources separately', () => {
    const urls = ['track', 'studio2', 'speech'].flatMap(facet => ['preaudit', 'renderer']
      .flatMap(phase => ['official', 'community'].map(sourceClass => createResearchSearchUrl(facet, phase, sourceClass))));

    expect(new Set(urls).size).toBe(12);
    expect(decodeURIComponent(urls[0])).toContain('help.suno.com');
    expect(decodeURIComponent(urls[1])).toContain('reddit.com/r/SunoAI');
    expect(() => createResearchSearchUrl('unknown', 'preaudit', 'official')).toThrow('Unknown facet');
  });

  test('evidence records expose all blueprint provenance fields', () => {
    const record = buildEvidenceRecord({ facet: 'studio2', phase: 'renderer', claim: 'test claim' });
    const fields = ['facet', 'phase', 'question', 'model', 'studioVersionOrMode', 'sourceClass', 'url', 'sourceDate', 'checkedAt', 'claim', 'observation', 'interpretation', 'contradictions', 'confidence', 'generalizationLimit', 'testCandidate', 'status'];

    fields.forEach(field => expect(record).toHaveProperty(field));
    expect(record.facet).toBe('studio2');
    expect(record.claim).toBe('test claim');
    expect(buildEvidenceRecord({ studioVersionOrMode: 'Studio 2 timeline' }).studioVersionOrMode).toBe('Studio 2 timeline');
    expect(buildEvidenceRecord()).toMatchObject({ facet: 'track', phase: 'preaudit', sourceClass: 'current_official', confidence: 'unrated', status: 'manual_review' });
    expect(buildEvidenceRecord({ id: 'fixed-id', checkedAt: '2026-10-02T00:00:00.000Z' })).toMatchObject({ id: 'fixed-id', checkedAt: '2026-10-02T00:00:00.000Z' });
  });
});
