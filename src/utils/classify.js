/* Bivariate debris × population classification, ported 1:1 from the Arcade
   expression in hexagonos_1ha_danos_wgs84_4.lyrx (ArcGIS Pro CIMUniqueValueRenderer).
   Quantile breaks are the exact values ArcGIS Pro computed for this dataset. */
const DEBRIS_BREAKS = [0, 0, 170.572301291018533220267, 28876.470472316043014871];
const POPULATION_BREAKS = [0, 12.0134045626328429534624, 73.8733584200958830479067, 341.546229348999077046756];
const LEVEL_CODES = ['L', 'M', 'H'];

function levelCode(value, breaks) {
  if (value == null || value < breaks[0]) return null;
  for (let i = 1; i < breaks.length; i++) {
    if (value <= breaks[i]) return LEVEL_CODES[i - 1];
  }
  return null;
}

export function getBivariateClass(debrisSum, population) {
  const d = levelCode(debrisSum, DEBRIS_BREAKS);
  const p = levelCode(population, POPULATION_BREAKS);
  return d && p ? d + p : null;
}

/* Bivariate palette from the .lyrx CIMFixedColorRamp (pink → purple → blue),
   first letter = debris_sum level, second letter = population level. */
export const BIVARIATE_CLASSES = [
  { id: 'LL', label: 'Low debris · Low population',    color: '#e9e6f2' },
  { id: 'LM', label: 'Low debris · Med population',     color: '#9ccae1' },
  { id: 'LH', label: 'Low debris · High population',    color: '#4fadd0' },
  { id: 'ML', label: 'Med debris · Low population',     color: '#e39bcc' },
  { id: 'MM', label: 'Med debris · Med population',      color: '#9080bd' },
  { id: 'MH', label: 'Med debris · High population',     color: '#3d64ad' },
  { id: 'HL', label: 'High debris · Low population',     color: '#de4fa6' },
  { id: 'HM', label: 'High debris · Med population',     color: '#843598' },
  { id: 'HH', label: 'High debris · High population',    color: '#2a1a8a' },
];

export function getBivariateInfo(classId) {
  return BIVARIATE_CLASSES.find(c => c.id === classId);
}
