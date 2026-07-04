const MMI_INFO = {
  1: { roman: 'I',    desc: 'Not felt' },
  2: { roman: 'II',   desc: 'Weak' },
  3: { roman: 'III',  desc: 'Weak' },
  4: { roman: 'IV',   desc: 'Light' },
  5: { roman: 'V',    desc: 'Moderate' },
  6: { roman: 'VI',   desc: 'Strong' },
  7: { roman: 'VII',  desc: 'Very strong' },
  8: { roman: 'VIII', desc: 'Severe' },
  9: { roman: 'IX',   desc: 'Violent' },
  10: { roman: 'X+',  desc: 'Extreme' },
};

export function mmiRoman(value) {
  return MMI_INFO[Math.floor(value)]?.roman ?? String(value);
}

export function mmiLabel(value) {
  return MMI_INFO[Math.floor(value)]?.desc ?? '';
}

const MMI_MIN = 3;
const MMI_MAX = 8;

/* green (low shaking) → yellow → red (severe shaking) */
export function mmiColorRGB(value) {
  const t = Math.min(1, Math.max(0, (value - MMI_MIN) / (MMI_MAX - MMI_MIN)));
  if (t < 0.5) {
    const k = t / 0.5;
    return [Math.round(255 * k), 255, 0];
  }
  const k = (t - 0.5) / 0.5;
  return [255, Math.round(255 * (1 - k)), 0];
}

export function mmiColor(value) {
  const [r, g, b] = mmiColorRGB(value);
  return `rgb(${r},${g},${b})`;
}

/* Legend entries spanning the contour levels present in the ShakeMap GeoJSON */
export const MMI_LEVELS = [3, 4, 5, 6, 7, 8].map(value => ({ value, color: mmiColor(value) }));
