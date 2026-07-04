import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCategory } from '../utils/classify';
import { mmiRoman, mmiLabel, MMI_LEVELS } from '../utils/mmi';
import { buildIntensityHeatmap } from '../utils/heatmap';

const BASEMAPS = {
  esri_imagery: {
    label: '🛰 Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, Maxar, GeoEye, Earthstar Geographics',
    maxZoom: 19,
  },
  esri_streets: {
    label: '🗺 Streets',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, HERE, Garmin, USGS',
    maxZoom: 19,
  },
  osm: {
    label: '🌍 OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
};

/* ── Marker factories ── */
function circleIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:13px;height:13px;background:${color};border:2px solid rgba(255,255,255,0.85);border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [13, 13], iconAnchor: [6, 6], popupAnchor: [0, -10],
  });
}

function diamondIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:13px;height:13px;background:${color};border:2px solid rgba(255,255,255,0.85);transform:rotate(45deg);box-shadow:0 1px 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [13, 13], iconAnchor: [6, 6], popupAnchor: [0, -10],
  });
}


const PLATFORM_ICONS = {
  instagram: '📸', x: '🐦', facebook: '📘', tiktok: '🎵', youtube: '▶️', otro: '🔗',
};

export default function BuildingMap({ buildings, activeCategories, socialReports, showSocialLayer, shakemap, showIntensityLayer }) {
  const mapRef        = useRef(null);
  const mapInst       = useRef(null);
  const intensityLayer = useRef(null);
  const inspLayer      = useRef(null);
  const socialLayer    = useRef(null);
  const baseTileRef    = useRef(null);
  const [activeBasemap, setActiveBasemap] = useState('esri_imagery');

  /* init map once */
  useEffect(() => {
    if (mapInst.current) return;
    const map = L.map(mapRef.current, { center: [10.5, -66.9], zoom: 10, zoomControl: true });
    const bm = BASEMAPS.esri_imagery;
    baseTileRef.current = L.tileLayer(bm.url, { attribution: bm.attribution, maxZoom: bm.maxZoom }).addTo(map);
    mapInst.current      = map;
    intensityLayer.current = L.layerGroup().addTo(map);
    inspLayer.current      = L.layerGroup().addTo(map);
    socialLayer.current    = L.layerGroup().addTo(map);
  }, []);

  const heatmap = useMemo(() => (shakemap ? buildIntensityHeatmap(shakemap) : null), [shakemap]);

  /* USGS ShakeMap intensity layer */
  useEffect(() => {
    if (!mapInst.current) return;
    intensityLayer.current.clearLayers();
    if (!showIntensityLayer || !heatmap) return;

    const overlay = L.imageOverlay(heatmap.url, heatmap.bounds, {
      opacity: 0.6,
      interactive: false,
      className: 'mmi-heat-img',
    });
    intensityLayer.current.addLayer(overlay);

    const { latitude, longitude } = shakemap.metadata || {};
    if (latitude != null && longitude != null) {
      const star = L.divIcon({
        className: '',
        html: `<div style="font-size:20px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.7))">⭐</div>`,
        iconSize: [20, 20], iconAnchor: [10, 10],
      });
      const epicenter = L.marker([latitude, longitude], { icon: star });
      epicenter.bindPopup(`<div style="font-size:13px"><b>Epicenter</b><br/>${latitude.toFixed(3)}, ${longitude.toFixed(3)}</div>`);
      intensityLayer.current.addLayer(epicenter);
    }
  }, [shakemap, showIntensityLayer]);

  /* inspection layer */
  useEffect(() => {
    if (!mapInst.current) return;
    inspLayer.current.clearLayers();
    const visible = buildings.filter(b => activeCategories.includes(getCategory(b.floors).id));
    visible.forEach(b => {
      const cat = getCategory(b.floors);
      const m = L.marker([b.lat, b.lng], { icon: circleIcon(cat.color) });
      m.bindPopup(`
        <div style="min-width:190px;font-size:13px">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px">${b.name}</div>
          <span style="color:${cat.color};font-weight:600;font-size:12px">${cat.label}</span>
          <hr style="margin:6px 0;border-color:#334155"/>
          <b>Floors:</b> ${b.floors}<br/>
          <b>City:</b> ${b.city || '—'}<br/>
          <b>State:</b> ${b.state || '—'}<br/>
          <b>Use:</b> ${b.use || '—'}<br/>
          <b>Material:</b> ${b.material || '—'}<br/>
          <b>Year built:</b> ${b.year || '—'}<br/>
          <b>Residents:</b> ${b.persons || '—'}<br/>
          ${b.result ? `<b>Status:</b> ${b.result}` : ''}
        </div>`);
      inspLayer.current.addLayer(m);
    });
    if (visible.length) {
      mapInst.current.fitBounds(
        L.latLngBounds(visible.map(b => [b.lat, b.lng])),
        { padding: [40, 40], maxZoom: 13 }
      );
    }
  }, [buildings, activeCategories]);

  /* social layer */
  useEffect(() => {
    if (!mapInst.current) return;
    socialLayer.current.clearLayers();
    if (!showSocialLayer) return;
    socialReports
      .filter(r => r.lat && r.lng)
      .forEach(r => {
        const color    = r.floors ? getCategory(r.floors).color : '#94a3b8';
        const catLabel = r.floors ? getCategory(r.floors).label : 'Unknown floors';
        const m = L.marker([r.lat, r.lng], { icon: diamondIcon(color) });
        const sourcesHtml = (r.sources || [])
          .filter(s => s.url)
          .map(s => {
            const icon = PLATFORM_ICONS[s.platform] || '🔗';
            return `<a href="${s.url}" target="_blank" style="color:#60a5fa;font-size:11px">${icon} ${s.platform}</a>`;
          }).join(' &nbsp;');
        m.bindPopup(`
          <div style="min-width:200px;font-size:13px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <span style="background:#f59e0b;color:#000;font-size:9px;font-weight:700;padding:2px 5px;border-radius:4px">SOCIAL REPORT</span>
            </div>
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${r.name}</div>
            <span style="color:${color};font-weight:600;font-size:12px">${catLabel}</span>
            <hr style="margin:6px 0;border-color:#334155"/>
            ${r.floors ? `<b>Floors:</b> ${r.floors}<br/>` : ''}
            <b>State:</b> ${r.state || '—'}<br/>
            <b>Municipality:</b> ${r.municipality || '—'}<br/>
            <b>Description:</b><br/>
            <span style="font-size:11px;color:#94a3b8">${(r.description || '').slice(0, 180)}${r.description?.length > 180 ? '…' : ''}</span>
            ${sourcesHtml ? `<hr style="margin:6px 0;border-color:#334155"/><b>Sources:</b> ${sourcesHtml}` : ''}
          </div>`);
        socialLayer.current.addLayer(m);
      });
  }, [socialReports, showSocialLayer]);

  /* swap basemap */
  useEffect(() => {
    if (!mapInst.current || !baseTileRef.current) return;
    const bm = BASEMAPS[activeBasemap];
    baseTileRef.current.remove();
    baseTileRef.current = L.tileLayer(bm.url, { attribution: bm.attribution, maxZoom: bm.maxZoom });
    baseTileRef.current.addTo(mapInst.current);
    baseTileRef.current.bringToBack();
  }, [activeBasemap]);

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, minWidth: 0 }}>
      <div ref={mapRef} className="map-container" />
      {/* USGS ShakeMap intensity legend */}
      {showIntensityLayer && (
        <div className="mmi-legend">
          <div className="mmi-legend-title">USGS Shaking Intensity</div>
          {MMI_LEVELS.map(l => (
            <div key={l.value} className="mmi-legend-row">
              <span className="mmi-swatch" style={{ background: l.color }} />
              <span>{mmiRoman(l.value)} · {mmiLabel(l.value)}</span>
            </div>
          ))}
        </div>
      )}
      {/* Basemap switcher */}
      <div className="basemap-switcher">
        {Object.entries(BASEMAPS).map(([key, bm]) => (
          <button
            key={key}
            className={`basemap-btn ${activeBasemap === key ? 'active' : ''}`}
            onClick={() => setActiveBasemap(key)}
          >
            {bm.label}
          </button>
        ))}
      </div>
    </div>
  );
}
