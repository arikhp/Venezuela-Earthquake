import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCategory } from '../utils/classify';

/* ── Marker factories ── */
function circleIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:13px;height:13px;
      background:${color};
      border:2px solid rgba(255,255,255,0.85);
      border-radius:50%;
      box-shadow:0 1px 5px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [13, 13], iconAnchor: [6, 6], popupAnchor: [0, -10],
  });
}

function diamondIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:13px;height:13px;
      background:${color};
      border:2px solid rgba(255,255,255,0.85);
      transform:rotate(45deg);
      box-shadow:0 1px 5px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [13, 13], iconAnchor: [6, 6], popupAnchor: [0, -10],
  });
}

const PLATFORM_ICONS = {
  instagram: '📸', x: '🐦', facebook: '📘', tiktok: '🎵', youtube: '▶️', otro: '🔗',
};

export default function BuildingMap({ buildings, activeCategories, socialReports, showSocialLayer }) {
  const mapRef  = useRef(null);
  const mapInst = useRef(null);
  const inspLayer  = useRef(null);
  const socialLayer = useRef(null);

  /* init map once */
  useEffect(() => {
    if (mapInst.current) return;
    const map = L.map(mapRef.current, { center: [10.5, -66.9], zoom: 10, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    mapInst.current  = map;
    inspLayer.current  = L.layerGroup().addTo(map);
    socialLayer.current = L.layerGroup().addTo(map);
  }, []);

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
        const color = r.floors ? getCategory(r.floors).color : '#94a3b8';
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

  return <div ref={mapRef} className="map-container" />;
}
