import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCategory } from '../utils/classify';

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

function squareIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:11px;height:11px;background:${color};border:2px solid rgba(255,255,255,0.85);box-shadow:0 1px 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [11, 11], iconAnchor: [6, 6], popupAnchor: [0, -10],
  });
}


const AFFECTED_STATUS_COLOR = { COLAPSO: '#dc2626', EMERGENCIA: '#f97316' };
const AFFECTED_DEFAULT_COLOR = '#a855f7';

export default function BuildingMap({
  buildings, activeCategories,
  affectedBuildings, showAffectedLayer,
}) {
  const mapRef        = useRef(null);
  const mapInst       = useRef(null);
  const affectedLayer  = useRef(null);
  const inspLayer      = useRef(null);
  const baseTileRef    = useRef(null);
  const [activeBasemap, setActiveBasemap] = useState('esri_imagery');

  /* init map once */
  useEffect(() => {
    if (mapInst.current) return;
    const map = L.map(mapRef.current, { center: [10.5, -66.9], zoom: 10, zoomControl: true });
    const bm = BASEMAPS.esri_imagery;
    baseTileRef.current = L.tileLayer(bm.url, { attribution: bm.attribution, maxZoom: bm.maxZoom }).addTo(map);
    mapInst.current      = map;
    affectedLayer.current   = L.layerGroup().addTo(map);
    inspLayer.current      = L.layerGroup().addTo(map);
  }, []);

  /* affected buildings layer (from KML survey) */
  useEffect(() => {
    if (!mapInst.current) return;
    affectedLayer.current.clearLayers();
    if (!showAffectedLayer || !affectedBuildings) return;
    affectedBuildings.forEach(b => {
      const color = AFFECTED_STATUS_COLOR[b.status] || AFFECTED_DEFAULT_COLOR;
      const m = L.marker([b.lat, b.lng], { icon: squareIcon(color) });
      m.bindPopup(`
        <div style="min-width:190px;font-size:13px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="background:#a855f7;color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:4px">SURVEY</span>
            ${b.status ? `<span style="background:${color};color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:4px">${b.status}</span>` : ''}
          </div>
          <div style="font-weight:700;font-size:14px;margin-bottom:4px">${b.name || 'Unnamed structure'}</div>
          <b>Type:</b> ${b.buildingType || '—'}<br/>
          <b>State:</b> ${b.state || '—'}<br/>
          <b>Municipality:</b> ${b.municipality || '—'}<br/>
          <b>Parish:</b> ${b.parish || '—'}
        </div>`);
      affectedLayer.current.addLayer(m);
    });
  }, [affectedBuildings, showAffectedLayer]);

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
      {/* Map legends */}
      <div className="legend-stack">
        {showAffectedLayer && (
          <div className="mmi-legend">
            <div className="mmi-legend-title">Surveyed Buildings</div>
            <div className="mmi-legend-row"><span className="affected-swatch" style={{ background: AFFECTED_DEFAULT_COLOR }} /><span>Surveyed structure</span></div>
            <div className="mmi-legend-row"><span className="affected-swatch" style={{ background: AFFECTED_STATUS_COLOR.EMERGENCIA }} /><span>Emergency</span></div>
            <div className="mmi-legend-row"><span className="affected-swatch" style={{ background: AFFECTED_STATUS_COLOR.COLAPSO }} /><span>Collapsed</span></div>
          </div>
        )}
      </div>
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
