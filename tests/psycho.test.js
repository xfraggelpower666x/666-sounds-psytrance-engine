/**
 * psycho.test.js
 * 666 SOUNDS DESIGN — Test Suite: Psychoakustik Engine
 *
 * Covers: Binaural Beats, Haas Effect, Isochronic Pulses,
 *         Room Acoustics, Tag Builder, Profile Data Integrity
 */

'use strict';

const {
  PSYCHO_PROFILES,
  HAAS_ZONES,
  ROOM_PRESETS,
  calcBinaural,
  isValidCarrier,
  getHaasZone,
  isHaasRange,
  isHaasFusionZone,
  isHaasPreEchoRisk,
  calcIsochronic,
  classifyBrainwaveBand,
  getRoomPreset,
  estimateEarlyReflection,
  buildPsychoTags
} = require('../src/psycho.calc');

// ─────────────────────────────────────────────────────────────
// PROFILE DATA INTEGRITY
// ─────────────────────────────────────────────────────────────

describe('Consciousness Profiles — Data Integrity', () => {
  const profileIds = Object.keys(PSYCHO_PROFILES);

  test('all 6 profiles are defined', () => {
    expect(profileIds).toHaveLength(6);
    expect(profileIds).toEqual(
      expect.arrayContaining(['trance', 'flow', 'hypnose', 'ekstase', 'meditation', 'ritual'])
    );
  });

  test.each(profileIds)('profile "%s" has valid hz (> 0)', (id) => {
    expect(PSYCHO_PROFILES[id].hz).toBeGreaterThan(0);
  });

  test.each(profileIds)('profile "%s" has a non-empty name', (id) => {
    expect(PSYCHO_PROFILES[id].name).toBeTruthy();
    expect(typeof PSYCHO_PROFILES[id].name).toBe('string');
  });

  test.each(profileIds)('profile "%s" has a non-empty band', (id) => {
    expect(PSYCHO_PROFILES[id].band).toBeTruthy();
  });

  test('Schumann resonance is 7.83 Hz', () => {
    expect(PSYCHO_PROFILES.ritual.hz).toBe(7.83);
  });

  test('Gamma (Ekstase) is 40 Hz', () => {
    expect(PSYCHO_PROFILES.ekstase.hz).toBe(40);
  });

  test('Theta (Trance) is 6 Hz', () => {
    expect(PSYCHO_PROFILES.trance.hz).toBe(6);
  });
});

// ─────────────────────────────────────────────────────────────
// BINAURAL BEATS
// ─────────────────────────────────────────────────────────────

describe('Binaural Beats — calcBinaural()', () => {
  test('trance: carrier 200 Hz → L=200, R=206, beat=6 Hz', () => {
    const result = calcBinaural(200, 'trance');
    expect(result.carrierL).toBe(200);
    expect(result.carrierR).toBe(206);
    expect(result.beatHz).toBe(6);
    expect(result.band).toBe('theta');
  });

  test('flow: carrier 200 Hz → R = 200 + 10 = 210 Hz', () => {
    const result = calcBinaural(200, 'flow');
    expect(result.carrierR).toBe(210);
    expect(result.beatHz).toBe(10);
    expect(result.band).toBe('alpha');
  });

  test('ekstase: carrier 200 Hz → R = 240 Hz (40 Hz gamma beat)', () => {
    const result = calcBinaural(200, 'ekstase');
    expect(result.carrierR).toBe(240);
    expect(result.beatHz).toBe(40);
    expect(result.band).toBe('gamma');
  });

  test('ritual: Schumann 7.83 Hz → R = 207.83 Hz', () => {
    const result = calcBinaural(200, 'ritual');
    expect(result.carrierR).toBeCloseTo(207.83, 2);
    expect(result.beatHz).toBe(7.83);
  });

  test('beat frequency equals R - L', () => {
    const result = calcBinaural(300, 'meditation');
    expect(result.carrierR - result.carrierL).toBeCloseTo(result.beatHz, 5);
  });

  test('different carrier frequencies produce correct offsets', () => {
    const r100 = calcBinaural(100, 'trance');
    const r400 = calcBinaural(400, 'trance');
    expect(r100.beatHz).toBe(r400.beatHz); // beat freq is carrier-independent
    expect(r100.carrierR).toBe(106);
    expect(r400.carrierR).toBe(406);
  });

  test('throws on unknown profile', () => {
    expect(() => calcBinaural(200, 'unknown_profile')).toThrow();
  });

  test('throws on zero carrier frequency', () => {
    expect(() => calcBinaural(0, 'trance')).toThrow();
  });

  test('throws on negative carrier frequency', () => {
    expect(() => calcBinaural(-100, 'trance')).toThrow();
  });
});

describe('Binaural Beats — isValidCarrier()', () => {
  test('200 Hz is valid', () => expect(isValidCarrier(200)).toBe(true));
  test('50 Hz (lower bound) is valid', () => expect(isValidCarrier(50)).toBe(true));
  test('1000 Hz (upper bound) is valid', () => expect(isValidCarrier(1000)).toBe(true));
  test('49 Hz is invalid', () => expect(isValidCarrier(49)).toBe(false));
  test('1001 Hz is invalid', () => expect(isValidCarrier(1001)).toBe(false));
  test('0 is invalid', () => expect(isValidCarrier(0)).toBe(false));
  test('-1 is invalid', () => expect(isValidCarrier(-1)).toBe(false));
  test('string is invalid', () => expect(isValidCarrier('200')).toBe(false));
});

// ─────────────────────────────────────────────────────────────
// HAAS EFFECT
// ─────────────────────────────────────────────────────────────

describe('Haas Effect — getHaasZone()', () => {
  test('1 ms → Fusion zone', () => {
    const zone = getHaasZone(1);
    expect(zone).not.toBeNull();
    expect(zone.zone).toBe('Fusion');
  });

  test('5 ms → still Fusion zone (upper boundary)', () => {
    expect(getHaasZone(5).zone).toBe('Fusion');
  });

  test('6 ms → Presence zone (lower boundary)', () => {
    expect(getHaasZone(6).zone).toBe('Presence');
  });

  test('12 ms → Presence zone (classic Haas delay)', () => {
    const zone = getHaasZone(12);
    expect(zone.zone).toBe('Presence');
  });

  test('15 ms → Presence zone (upper boundary)', () => {
    expect(getHaasZone(15).zone).toBe('Presence');
  });

  test('16 ms → Width zone', () => {
    expect(getHaasZone(16).zone).toBe('Width');
  });

  test('20 ms → Width zone', () => {
    expect(getHaasZone(20).zone).toBe('Width');
  });

  test('26 ms → Pre-Echo zone', () => {
    expect(getHaasZone(26).zone).toBe('Pre-Echo');
  });

  test('35 ms → Pre-Echo zone (upper boundary)', () => {
    expect(getHaasZone(35).zone).toBe('Pre-Echo');
  });

  test('0 ms → null (out of range)', () => {
    expect(getHaasZone(0)).toBeNull();
  });

  test('36 ms → null (beyond pre-echo)', () => {
    expect(getHaasZone(36)).toBeNull();
  });
});

describe('Haas Effect — Zone utility functions', () => {
  test('isHaasRange: 1–35 ms is valid', () => {
    for (let ms = 1; ms <= 35; ms++) {
      expect(isHaasRange(ms)).toBe(true);
    }
  });

  test('isHaasRange: 0 ms is invalid', () => expect(isHaasRange(0)).toBe(false));
  test('isHaasRange: 36 ms is invalid', () => expect(isHaasRange(36)).toBe(false));

  test('isHaasFusionZone: 1–5 ms is fusion', () => {
    [1, 2, 3, 4, 5].forEach(ms => expect(isHaasFusionZone(ms)).toBe(true));
  });
  test('isHaasFusionZone: 6 ms is not fusion', () => {
    expect(isHaasFusionZone(6)).toBe(false);
  });

  test('isHaasPreEchoRisk: > 25 ms triggers risk', () => {
    expect(isHaasPreEchoRisk(26)).toBe(true);
    expect(isHaasPreEchoRisk(35)).toBe(true);
  });
  test('isHaasPreEchoRisk: ≤ 25 ms is safe', () => {
    expect(isHaasPreEchoRisk(25)).toBe(false);
    expect(isHaasPreEchoRisk(12)).toBe(false);
  });

  test('all 4 zones have unique names', () => {
    const names = HAAS_ZONES.map(z => z.zone);
    expect(new Set(names).size).toBe(4);
  });

  test('zones cover the full 1–35 ms range without gaps', () => {
    for (let ms = 1; ms <= 35; ms++) {
      expect(getHaasZone(ms)).not.toBeNull();
    }
  });
});

// ─────────────────────────────────────────────────────────────
// ISOCHRONIC PULSES
// ─────────────────────────────────────────────────────────────

describe('Isochronic Pulses — calcIsochronic()', () => {
  test('6 Hz: period = 166.67 ms, pulse-on = 83.33 ms', () => {
    const result = calcIsochronic(6);
    expect(result.periodMs).toBeCloseTo(166.67, 1);
    expect(result.pulseOnMs).toBeCloseTo(83.33, 1);
    expect(result.pulseOffMs).toBeCloseTo(83.33, 1);
  });

  test('40 Hz (gamma): period = 25 ms', () => {
    const result = calcIsochronic(40);
    expect(result.periodMs).toBeCloseTo(25, 2);
  });

  test('10 Hz (alpha): BPM equivalent = 600', () => {
    const result = calcIsochronic(10);
    expect(result.bpmEquivalent).toBe(600);
  });

  test('1 Hz: period = 1000 ms', () => {
    const result = calcIsochronic(1);
    expect(result.periodMs).toBe(1000);
  });

  test('pulse-on + pulse-off = period (50% duty cycle)', () => {
    [3.5, 5, 6, 7.83, 10, 40].forEach(hz => {
      const r = calcIsochronic(hz);
      expect(r.pulseOnMs + r.pulseOffMs).toBeCloseTo(r.periodMs, 5);
    });
  });

  test('bpmEquivalent = hz * 60', () => {
    [6, 7.83, 10, 40].forEach(hz => {
      expect(calcIsochronic(hz).bpmEquivalent).toBeCloseTo(hz * 60, 5);
    });
  });

  test('throws on 0 Hz', () => {
    expect(() => calcIsochronic(0)).toThrow();
  });

  test('throws on negative Hz', () => {
    expect(() => calcIsochronic(-5)).toThrow();
  });
});

describe('Isochronic Pulses — classifyBrainwaveBand()', () => {
  test('3.5 Hz → delta', ()  => expect(classifyBrainwaveBand(3.5)).toBe('delta'));
  test('6 Hz → theta', ()    => expect(classifyBrainwaveBand(6)).toBe('theta'));
  test('7.83 Hz → theta', () => expect(classifyBrainwaveBand(7.83)).toBe('theta'));
  test('10 Hz → alpha', ()   => expect(classifyBrainwaveBand(10)).toBe('alpha'));
  test('20 Hz → beta', ()    => expect(classifyBrainwaveBand(20)).toBe('beta'));
  test('40 Hz → gamma', ()   => expect(classifyBrainwaveBand(40)).toBe('gamma'));
  test('0.1 Hz → unknown', ()=> expect(classifyBrainwaveBand(0.1)).toBe('unknown'));

  test('profile bands match classifyBrainwaveBand()', () => {
    // Verify profile metadata agrees with the classifier
    expect(classifyBrainwaveBand(PSYCHO_PROFILES.trance.hz)).toBe('theta');
    expect(classifyBrainwaveBand(PSYCHO_PROFILES.flow.hz)).toBe('alpha');
    expect(classifyBrainwaveBand(PSYCHO_PROFILES.ekstase.hz)).toBe('gamma');
    expect(classifyBrainwaveBand(PSYCHO_PROFILES.meditation.hz)).toBe('theta');
    // delta/theta boundary check for hypnose (3.5 Hz)
    expect(classifyBrainwaveBand(PSYCHO_PROFILES.hypnose.hz)).toBe('delta');
  });
});

// ─────────────────────────────────────────────────────────────
// ROOM ACOUSTICS
// ─────────────────────────────────────────────────────────────

describe('Room Acoustics — getRoomPreset()', () => {
  test('tight: RT60 = 0.3 s', () => {
    expect(getRoomPreset('tight').rt60).toBe(0.3);
  });

  test('club: RT60 = 0.8 s', () => {
    expect(getRoomPreset('club').rt60).toBe(0.8);
  });

  test('cave: RT60 = 2.5 s', () => {
    expect(getRoomPreset('cave').rt60).toBe(2.5);
  });

  test('cosmic: RT60 = 8.0 s', () => {
    expect(getRoomPreset('cosmic').rt60).toBe(8.0);
  });

  test('all presets have non-empty tag strings', () => {
    Object.keys(ROOM_PRESETS).forEach(id => {
      expect(getRoomPreset(id).tag).toBeTruthy();
    });
  });

  test('RT60 ordering: tight < club < cave < cosmic', () => {
    expect(getRoomPreset('tight').rt60).toBeLessThan(getRoomPreset('club').rt60);
    expect(getRoomPreset('club').rt60).toBeLessThan(getRoomPreset('cave').rt60);
    expect(getRoomPreset('cave').rt60).toBeLessThan(getRoomPreset('cosmic').rt60);
  });

  test('throws on unknown preset id', () => {
    expect(() => getRoomPreset('disco')).toThrow();
  });
});

describe('Room Acoustics — estimateEarlyReflection()', () => {
  test('larger RT60 → later early reflection', () => {
    const tight  = estimateEarlyReflection(0.3);
    const cosmic = estimateEarlyReflection(8.0);
    expect(tight).toBeLessThan(cosmic);
  });

  test('returns a positive number', () => {
    expect(estimateEarlyReflection(0.8)).toBeGreaterThan(0);
  });

  test('throws on RT60 = 0', () => {
    expect(() => estimateEarlyReflection(0)).toThrow();
  });

  test('throws on negative RT60', () => {
    expect(() => estimateEarlyReflection(-1)).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────
// TAG BUILDER
// ─────────────────────────────────────────────────────────────

describe('buildPsychoTags()', () => {
  test('all effects on → 4 comma-separated tags', () => {
    const tag = buildPsychoTags(
      { binaural: true, haas: true, isochronic: true, room: true },
      'trance', 12, 'club'
    );
    const parts = tag.split(', ');
    expect(parts).toHaveLength(4);
  });

  test('binaural tag contains Hz value and band', () => {
    const tag = buildPsychoTags(
      { binaural: true, haas: false, isochronic: false, room: false },
      'trance', 12, 'club'
    );
    expect(tag).toContain('6Hz');
    expect(tag).toContain('theta');
  });

  test('haas tag contains delay in ms', () => {
    const tag = buildPsychoTags(
      { binaural: false, haas: true, isochronic: false, room: false },
      'trance', 12, 'club'
    );
    expect(tag).toContain('12ms');
  });

  test('isochronic tag contains Hz value', () => {
    const tag = buildPsychoTags(
      { binaural: false, haas: false, isochronic: true, room: false },
      'trance', 12, 'club'
    );
    expect(tag).toContain('6Hz');
    expect(tag).toContain('pulse');
  });

  test('room tag matches preset tag string', () => {
    const tag = buildPsychoTags(
      { binaural: false, haas: false, isochronic: false, room: true },
      'trance', 12, 'cave'
    );
    expect(tag).toBe('deep cave reverb');
  });

  test('no effects → empty string', () => {
    const tag = buildPsychoTags(
      { binaural: false, haas: false, isochronic: false, room: false },
      'trance', 12, 'club'
    );
    expect(tag).toBe('');
  });

  test('all effects: output fits within 100 chars (Suno budget)', () => {
    const tag = buildPsychoTags(
      { binaural: true, haas: true, isochronic: true, room: true },
      'ekstase', 20, 'cosmic'
    );
    expect(tag.length).toBeLessThanOrEqual(100);
  });

  test('throws on unknown profile', () => {
    expect(() => buildPsychoTags(
      { binaural: true }, 'unknown', 12, 'club'
    )).toThrow();
  });

  test('throws on unknown room preset', () => {
    expect(() => buildPsychoTags(
      { room: true }, 'trance', 12, 'unknown'
    )).toThrow();
  });
});
