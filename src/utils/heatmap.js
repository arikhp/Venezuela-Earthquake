import { mmiColorRGB } from './mmi';

/**
 * Rasterizes the USGS ShakeMap MMI contour lines into a smooth color-graded
 * raster via inverse-distance weighting, since the source data only has
 * isolines (no filled polygons) to sample from.
 */
export function buildIntensityHeatmap(shakemap, { width = 220, height = 170, maxPoints = 500 } = {}) {
  const [minLng, minLat, maxLng, maxLat] = shakemap.bbox;

  let points = [];
  shakemap.features.forEach(f => {
    const value = f.properties.value;
    const lines = f.geometry.type === 'MultiLineString' ? f.geometry.coordinates : [f.geometry.coordinates];
    lines.forEach(line => line.forEach(([lng, lat]) => points.push({ lng, lat, value })));
  });
  if (points.length > maxPoints) {
    const step = Math.ceil(points.length / maxPoints);
    points = points.filter((_, i) => i % step === 0);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);

  for (let py = 0; py < height; py++) {
    const lat = maxLat - (py / (height - 1)) * (maxLat - minLat);
    for (let px = 0; px < width; px++) {
      const lng = minLng + (px / (width - 1)) * (maxLng - minLng);
      let weightSum = 0, valueSum = 0;
      for (const p of points) {
        const dLat = p.lat - lat, dLng = p.lng - lng;
        const distSq = dLat * dLat + dLng * dLng;
        if (distSq < 1e-8) { weightSum = 1; valueSum = p.value; break; }
        const w = 1 / (distSq * distSq); // steep falloff so nearest contour dominates
        weightSum += w;
        valueSum += w * p.value;
      }
      const value = valueSum / weightSum;
      const [r, g, b] = mmiColorRGB(value);
      const idx = (py * width + px) * 4;
      imgData.data[idx] = r;
      imgData.data[idx + 1] = g;
      imgData.data[idx + 2] = b;
      imgData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  return {
    url: canvas.toDataURL(),
    bounds: [[minLat, minLng], [maxLat, maxLng]],
  };
}
