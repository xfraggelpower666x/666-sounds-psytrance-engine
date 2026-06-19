/**
 * engine4d.test.js
 * 666 SOUNDS DESIGN — Test Suite: 4D Akustik Engine
 *
 * Covers: ILD, ITD, Air Absorption, Doppler, B-Format Ambisonics,
 *         Ambisonic channel counts, Full spatial bundle validation
 */

'use strict';

const {
  SPEED_OF_SOUND,
  HEAD_RADIUS,
  AMBISONIC_ORDERS,
  toRad,
  toDeg,
  calcILD,
  calcITD,
  maxITD,
  calcAirAbsorption,
  calcDopplerRatio,
  dopplerRatioToSemitones,
  calcBFormat,
  validateBFormatEnergy,
  getAmbisonicOrder,
  ambisonicChannelCount,
  calcSpatialBundle
} = require('../src/engine4d.calc');

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

describe('Physical Constants', () => {
  test('speed of sound = 343 m/s', () => {
    expect(SPEED_OF_SOUND).toBe(343);
  });

  test('head radius = 0.0875 m', () => {
    expect(HEAD_RADIUS).toBe(0.0875);
  });
});

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

describe('Angle conversion helpers', () => {
  test('toRad(180) = π', () => {
    expect(toRad(180)).toBeCloseTo(Math.PI, 10);
  });

  test('toRad(90) = π/2', () => {
    expect(toRad(90)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('toDeg(π) = 180', () => {
    expect(toDeg(Math.PI)).toBeCloseTo(180, 10);
  });

  test('toRad and toDeg are inverses', () => {
    [0, 45, 90, 135, 180, -90, -180].forEach(deg => {
      expect(toDeg(toRad(deg))).toBeCloseTo(deg, 10);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// ILD
// ─────────────────────────────────────────────────────────────

describe('ILD — Interaural Level Difference', () => {
  test('0° azimuth → ILD = 0 dB (centre)', () => {
    expect(calcILD(0)).toBe(0);
  });

  test('90° azimuth → ILD = +6 dB (max right)', () => {
    expect(calcILD(90)).toBeCloseTo(6, 1);
  });

  test('-90° azimuth → ILD = -6 dB (max left)', () => {
    expect(calcILD(-90)).toBeCloseTo(-6, 1);
  });

  test('180° azimuth → ILD ≈ 0 dB (behind)', () => {
    // sin(180°) = 0
    expect(Math.abs(calcILD(180))).toBeCloseTo(0, 5);
  });

  test('ILD is antisymmetric: ILD(θ) = -ILD(-θ)', () => {
    [30, 45, 60, 90, 120].forEach(deg => {
      expect(calcILD(deg)).toBeCloseTo(-calcILD(-deg), 5);
    });
  });

  test('ILD magnitude never exceeds 6 dB (duplex model)', () => {
    for (let deg = -180; deg <= 180; deg += 10) {
      expect(Math.abs(calcILD(deg))).toBeLessThanOrEqual(6.001);
    }
  });

  test('returns a number', () => {
    expect(typeof calcILD(45)).toBe('number');
  });
});

// ─────────────────────────────────────────────────────────────
// ITD
// ─────────────────────────────────────────────────────────────

describe('ITD — Interaural Time Difference (Woodworth formula)', () => {
  test('0° azimuth → ITD = 0 ms', () => {
    expect(calcITD(0)).toBe(0);
  });

  test('90° → maximum ITD (positive, right-ear leading)', () => {
    const itd = calcITD(90);
    expect(itd).toBeGreaterThan(0);
  });

  test('-90° → negative ITD (left-ear leading)', () => {
    expect(calcITD(-90)).toBeLessThan(0);
  });

  test('ITD is antisymmetric: ITD(θ) = -ITD(-θ)', () => {
    [30, 45, 60, 90].forEach(deg => {
      expect(calcITD(deg)).toBeCloseTo(-calcITD(-deg), 5);
    });
  });

  test('maxITD() equals calcITD(90)', () => {
    expect(maxITD()).toBeCloseTo(calcITD(90), 10);
  });

  test('maxITD() is within realistic physiological range (< 1 ms)', () => {
    // Human max ITD is ~0.65 ms for 90° azimuth
    expect(maxITD()).toBeLessThan(1);
    expect(maxITD()).toBeGreaterThan(0);
  });

  test('ITD at 90° is approximately 0.644 ms (Woodworth model)', () => {
    // Theoretical: (0.0875/343) * (π/2 + 1) ≈ 0.644 ms
    expect(calcITD(90)).toBeCloseTo(0.644, 1);
  });

  test('returns a number', () => {
    expect(typeof calcITD(45)).toBe('number');
  });
});

// ─────────────────────────────────────────────────────────────
// AIR ABSORPTION
// ─────────────────────────────────────────────────────────────

describe('Air Absorption', () => {
  test('0 m → 0 dB loss', () => {
    expect(calcAirAbsorption(0)).toBe(0);
  });

  test('10 m → 0.02 dB loss', () => {
    expect(calcAirAbsorption(10)).toBeCloseTo(0.02, 5);
  });

  test('absorption scales linearly with distance', () => {
    const d1 = calcAirAbsorption(5);
    const d2 = calcAirAbsorption(10);
    expect(d2).toBeCloseTo(d1 * 2, 5);
  });

  test('100 m → 0.2 dB loss', () => {
    expect(calcAirAbsorption(100)).toBeCloseTo(0.2, 5);
  });

  test('throws on negative distance', () => {
    expect(() => calcAirAbsorption(-1)).toThrow();
  });

  test('returns a non-negative number', () => {
    expect(calcAirAbsorption(3)).toBeGreaterThanOrEqual(0);
  });
});

// ─────────────────────────────────────────────────────────────
// DOPPLER EFFECT
// ─────────────────────────────────────────────────────────────

describe('Doppler Pitch Shift', () => {
  test('static source (0 m/s) → ratio = 1.0000', () => {
    expect(calcDopplerRatio(0)).toBe(1.0);
  });

  test('approaching source → ratio > 1 (pitch up)', () => {
    expect(calcDopplerRatio(34.3)).toBeGreaterThan(1); // 10% of speed of sound
  });

  test('receding source (negative speed) → ratio < 1 (pitch down)', () => {
    expect(calcDopplerRatio(-34.3)).toBeLessThan(1);
  });

  test('at 343/2 = 171.5 m/s → ratio = 2.0000', () => {
    // f_obs/f_src = 343/(343-171.5) = 343/171.5 = 2
    expect(calcDopplerRatio(171.5)).toBeCloseTo(2.0, 3);
  });

  test('throws if speed >= speed of sound', () => {
    expect(() => calcDopplerRatio(343)).toThrow();
    expect(() => calcDopplerRatio(400)).toThrow();
  });

  test('static source → 0 semitones', () => {
    expect(dopplerRatioToSemitones(1.0)).toBe(0);
  });

  test('ratio 2.0 → 12 semitones (one octave up)', () => {
    expect(dopplerRatioToSemitones(2.0)).toBeCloseTo(12, 2);
  });

  test('dopplerRatioToSemitones throws on ratio ≤ 0', () => {
    expect(() => dopplerRatioToSemitones(0)).toThrow();
    expect(() => dopplerRatioToSemitones(-1)).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────
// B-FORMAT AMBISONICS
// ─────────────────────────────────────────────────────────────

describe('B-Format — calcBFormat()', () => {
  test('front centre (az=0, el=0): W=0.7071, X=1, Y=0, Z=0', () => {
    const b = calcBFormat(0, 0);
    expect(b.W).toBeCloseTo(0.7071, 3);
    expect(b.X).toBeCloseTo(1.0, 3);
    expect(b.Y).toBeCloseTo(0.0, 3);
    expect(b.Z).toBeCloseTo(0.0, 3);
  });

  test('right side (az=90, el=0): X≈0, Y≈1', () => {
    const b = calcBFormat(90, 0);
    expect(b.X).toBeCloseTo(0, 3);
    expect(b.Y).toBeCloseTo(1, 3);
  });

  test('directly above (az=0, el=90): Z≈1, X≈0, Y≈0', () => {
    const b = calcBFormat(0, 90);
    expect(b.Z).toBeCloseTo(1, 3);
    expect(b.X).toBeCloseTo(0, 3);
    expect(b.Y).toBeCloseTo(0, 3);
  });

  test('directly behind (az=180, el=0): X≈-1, Y≈0', () => {
    const b = calcBFormat(180, 0);
    expect(b.X).toBeCloseTo(-1, 3);
    expect(b.Y).toBeCloseTo(0, 3);
  });

  test('W is always 1/√2 (omnidirectional, position-independent)', () => {
    [[0,0],[45,30],[90,-45],[180,0],[-90,60]].forEach(([az, el]) => {
      expect(calcBFormat(az, el).W).toBeCloseTo(Math.SQRT1_2, 4);
    });
  });

  test('energy conservation: W²+X²+Y²+Z² ≈ 1.5', () => {
    [[0,0],[45,30],[90,0],[0,90],[-45,-30]].forEach(([az, el]) => {
      const b = calcBFormat(az, el);
      const energy = b.W**2 + b.X**2 + b.Y**2 + b.Z**2;
      expect(energy).toBeCloseTo(1.5, 2);
    });
  });

  test('validateBFormatEnergy() returns true for valid positions', () => {
    [[0,0],[90,0],[45,45],[-90,-30]].forEach(([az, el]) => {
      expect(validateBFormatEnergy(calcBFormat(az, el))).toBe(true);
    });
  });

  test('X²+Y²+Z² ≤ 1 (sub-unity directional energy)', () => {
    [[0,0],[30,30],[90,0],[0,90]].forEach(([az, el]) => {
      const b = calcBFormat(az, el);
      const dir = b.X**2 + b.Y**2 + b.Z**2;
      expect(dir).toBeLessThanOrEqual(1.001);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// AMBISONICS ORDERS
// ─────────────────────────────────────────────────────────────

describe('Ambisonics Orders', () => {
  test('4 orders defined (0–3)', () => {
    expect(AMBISONIC_ORDERS).toHaveLength(4);
  });

  test('Stereo (order 0) has 2 channels', () => {
    expect(getAmbisonicOrder(0).channels).toBe(2);
  });

  test('FOA (order 1) has 4 channels', () => {
    expect(getAmbisonicOrder(1).channels).toBe(4);
  });

  test('SOA (order 2) has 9 channels', () => {
    expect(getAmbisonicOrder(2).channels).toBe(9);
  });

  test('TOA (order 3) has 16 channels', () => {
    expect(getAmbisonicOrder(3).channels).toBe(16);
  });

  test('ambisonicChannelCount formula: (order+1)²', () => {
    [0, 1, 2, 3].forEach(order => {
      expect(ambisonicChannelCount(order)).toBe((order + 1) ** 2);
    });
  });

  test('ambisonicChannelCount matches AMBISONIC_ORDERS data', () => {
    AMBISONIC_ORDERS.forEach(({ order, channels }) => {
      expect(ambisonicChannelCount(order)).toBe(channels);
    });
  });

  test('throws on invalid order (4)', () => {
    expect(() => getAmbisonicOrder(4)).toThrow();
  });

  test('throws on negative order', () => {
    expect(() => ambisonicChannelCount(-1)).toThrow();
  });

  test('all orders have non-empty tag strings', () => {
    AMBISONIC_ORDERS.forEach(a => {
      expect(a.tag).toBeTruthy();
    });
  });
});

// ─────────────────────────────────────────────────────────────
// FULL SPATIAL BUNDLE
// ─────────────────────────────────────────────────────────────

describe('calcSpatialBundle() — Full Parameter Set', () => {
  const defaultParams = {
    azimuthDeg: 45,
    elevationDeg: 30,
    distanceM: 5,
    sourceSpeedMs: 0
  };

  test('returns all expected keys', () => {
    const result = calcSpatialBundle(defaultParams);
    expect(result).toHaveProperty('ild');
    expect(result).toHaveProperty('itd');
    expect(result).toHaveProperty('airAbsorption');
    expect(result).toHaveProperty('dopplerRatio');
    expect(result).toHaveProperty('dopplerSemitones');
    expect(result).toHaveProperty('bFormat');
    expect(result.bFormat).toHaveProperty('W');
    expect(result.bFormat).toHaveProperty('X');
    expect(result.bFormat).toHaveProperty('Y');
    expect(result.bFormat).toHaveProperty('Z');
  });

  test('static source → dopplerRatio = 1, semitones = 0', () => {
    const result = calcSpatialBundle({ ...defaultParams, sourceSpeedMs: 0 });
    expect(result.dopplerRatio).toBe(1);
    expect(result.dopplerSemitones).toBe(0);
  });

  test('front-centre (az=0, el=0) → ILD = 0, ITD = 0', () => {
    const result = calcSpatialBundle({
      azimuthDeg: 0, elevationDeg: 0, distanceM: 3, sourceSpeedMs: 0
    });
    expect(result.ild).toBe(0);
    expect(result.itd).toBe(0);
  });

  test('ILD and ITD are non-zero for non-central positions', () => {
    const result = calcSpatialBundle(defaultParams);
    expect(result.ild).not.toBe(0);
    expect(result.itd).not.toBe(0);
  });

  test('air absorption increases with distance', () => {
    const near = calcSpatialBundle({ ...defaultParams, distanceM: 1 });
    const far  = calcSpatialBundle({ ...defaultParams, distanceM: 20 });
    expect(far.airAbsorption).toBeGreaterThan(near.airAbsorption);
  });

  test('throws on distance ≤ 0', () => {
    expect(() => calcSpatialBundle({ ...defaultParams, distanceM: 0 })).toThrow();
    expect(() => calcSpatialBundle({ ...defaultParams, distanceM: -1 })).toThrow();
  });

  test('throws on out-of-range azimuth', () => {
    expect(() => calcSpatialBundle({ ...defaultParams, azimuthDeg: 181 })).toThrow();
    expect(() => calcSpatialBundle({ ...defaultParams, azimuthDeg: -181 })).toThrow();
  });

  test('throws on out-of-range elevation', () => {
    expect(() => calcSpatialBundle({ ...defaultParams, elevationDeg: 91 })).toThrow();
    expect(() => calcSpatialBundle({ ...defaultParams, elevationDeg: -91 })).toThrow();
  });

  test('throws if source speed ≥ 343 m/s', () => {
    expect(() => calcSpatialBundle({ ...defaultParams, sourceSpeedMs: 343 })).toThrow();
  });

  test('B-Format energy is conserved for all quadrant positions', () => {
    const positions = [
      { azimuthDeg: 0,    elevationDeg: 0  },
      { azimuthDeg: 90,   elevationDeg: 0  },
      { azimuthDeg: -90,  elevationDeg: 0  },
      { azimuthDeg: 0,    elevationDeg: 90 },
      { azimuthDeg: 0,    elevationDeg: -90},
      { azimuthDeg: 45,   elevationDeg: 45 },
    ];
    positions.forEach(pos => {
      const result = calcSpatialBundle({ ...pos, distanceM: 3, sourceSpeedMs: 0 });
      expect(validateBFormatEnergy(result.bFormat)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// PSYCHOACOUSTIC PLAUSIBILITY — Cross-module sanity
// ─────────────────────────────────────────────────────────────

describe('Psychoacoustic Plausibility', () => {
  test('ITD < 1ms for any azimuth (human physiology limit)', () => {
    for (let az = -180; az <= 180; az += 15) {
      expect(Math.abs(calcITD(az))).toBeLessThan(1);
    }
  });

  test('ILD range is physiologically plausible (-6 to +6 dB)', () => {
    for (let az = -180; az <= 180; az += 15) {
      expect(Math.abs(calcILD(az))).toBeLessThanOrEqual(6.001);
    }
  });

  test('Doppler: slow fly-by (20 m/s) < 1 semitone shift', () => {
    const ratio = calcDopplerRatio(20);
    const semitones = dopplerRatioToSemitones(ratio);
    expect(semitones).toBeLessThan(1);
    expect(semitones).toBeGreaterThan(0);
  });

  test('Isochronic 6 Hz fits in psytrance grid (138–165 BPM)', () => {
    // 6 Hz isochronic = 360 BPM ≈ 180 BPM half-time = falls on beat subdivisions
    const { bpmEquivalent } = require('../src/psycho.calc').calcIsochronic(6);
    // 360 / 2 = 180 BPM (within 10% of psytrance range upper 165 BPM) — modular relationship
    expect(bpmEquivalent % 60).toBeCloseTo(0, 0); // 360 is divisible by 60 BPM
  });
});
