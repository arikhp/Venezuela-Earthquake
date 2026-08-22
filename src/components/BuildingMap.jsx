import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCategory } from '../utils/classify';

function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

export default function BuildingMap({ buildings, activeCategories }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (instanceRef.current) return;
    const map = L.map(mapRef.current, {
      center: [10.5, -66.9],
      zoom: 10,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    instanceRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
  }, []);

  useEffect(() => {
    if (!instanceRef.current) return;
    const layer = layerRef.current;
    layer.clearLayers();

    const visible = buildings.filter(b => activeCategories.includes(getCategory(b.floors).id));

    visible.forEach(b => {
      const cat = getCategory(b.floors);
      const marker = L.marker([b.lat, b.lng], { icon: makeIcon(cat.color) });
      marker.bindPopup(`
        <div style="min-width:180px;font-family:sans-serif;font-size:13px">
          <strong style="font-size:14px">${b.name}</strong><br/>
          <span style="color:${cat.color};font-weight:600">${cat.label}</span><br/>
          <hr style="margin:6px 0;border-color:#eee"/>
          <b>Floors:</b> ${b.floors}<br/>
          <b>City:</b> ${b.city || '—'}<br/>
          <b>State:</b> ${b.state || '—'}<br/>
          <b>Use:</b> ${b.use || '—'}<br/>
          <b>Material:</b> ${b.material || '—'}<br/>
          <b>Year built:</b> ${b.year || '—'}<br/>
          <b>Residents:</b> ${b.persons || '—'}<br/>
          ${b.result ? `<b>Status:</b> ${b.result}<br/>` : ''}
        </div>
      `);
      layer.addLayer(marker);
    });

    if (visible.length > 0) {
      const latlngs = visible.map(b => [b.lat, b.lng]);
      instanceRef.current.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40], maxZoom: 13 });
    }
  }, [buildings, activeCategories]);

  return <div ref={mapRef} className="map-container" />;
}
