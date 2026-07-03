export const CATEGORIES = [
  { id: '0-3',  label: '0 – 3 floors',   min: 0,  max: 3,   color: '#22c55e' },
  { id: '3-5',  label: '3 – 5 floors',   min: 4,  max: 5,   color: '#3b82f6' },
  { id: '5-10', label: '5 – 10 floors',  min: 6,  max: 10,  color: '#f59e0b' },
  { id: '10+',  label: '10+ floors',     min: 11, max: Infinity, color: '#ef4444' },
];

export function getCategory(floors) {
  if (floors <= 3)  return CATEGORIES[0];
  if (floors <= 5)  return CATEGORIES[1];
  if (floors <= 10) return CATEGORIES[2];
  return CATEGORIES[3];
}
