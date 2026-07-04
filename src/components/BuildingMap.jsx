import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BASEMAPS } from '../utils/basemaps';

const AFFECTED_STATUS_COLOR = { COLAPSO: '#dc2626', EMERGENCIA: '#f97316' };
const AFFECTED_DEFAULT_COLOR = '#a855f7';

export default function BuildingMap({ affectedBuildings, showAffectedLayer }) {
  const mapRef       = useRef(null);
  const mapInst      = useRef(null);
  const affectedLayer = useRef(null);
  const baseTileRef   = useRef(null);
  const [activeBasemap, setActiveBasemap] = useState('esri_imagery');

  /* init map once */
  useEffect(() => {
    if (mapInst.current) return;
    const map = L.map(mapRef.current, { center: [10.5, -66.9], zoom: 10, zoomControl: true });
    const bm = BASEMAPS.esri_imagery;
    baseTileRef.current = L.tileLayer(bm.url, { attribution: bm.attribution, maxZoom: bm.maxZoom }).addTo(map);
    mapInst.current       = map;
    affectedLayer.current = L.layerGroup().addTo(map);
  }, []);

  /* affected buildings layer (shapefile footprints) */
  useEffect(() => {
    if (!mapInst.current) return;
    affectedLayer.current.clearLayers();
    if (!showAffectedLayer || !affectedBuildings) return;
    affectedBuildings.forEach(b => {
      const color = AFFECTED_STATUS_COLOR[b.status] || AFFECTED_DEFAULT_COLOR;
      const poly = L.polygon(b.polygon, {
        color,
        weight: 1.5,
        fillColor: color,
        fillOpacity: b.status ? 0.7 : 0.35,
      });
      poly.bindPopup(`
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
      affectedLayer.current.addLayer(poly);
    });
    mapInst.current.fitBounds(
      L.latLngBounds(affectedBuildings.map(b => [b.lat, b.lng])),
      { padding: [30, 30] }
    );
  }, [affectedBuildings, showAffectedLayer]);

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
