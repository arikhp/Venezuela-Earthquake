import { useEffect, useRef, useState } from 'react';
import '@arcgis/core/assets/esri/themes/dark/main.css';
import esriConfig from '@arcgis/core/config';
import { getBivariateClass, BIVARIATE_CLASSES } from '../utils/classify';

/* Point ArcGIS assets at the CDN so workers/fonts load correctly */
esriConfig.assetsPath = 'https://js.arcgis.com/5.1/@arcgis/core/assets';

const BASEMAPS = {
  satellite: { id: 'satellite', label: '🛰 Satellite' },
  streets:   { id: 'streets',   label: '🗺 Streets'   },
  topo:      { id: 'topo',      label: '⛰ Topo'      },
  osm:       { id: 'osm',       label: '🌍 OSM'       },
};

function toRgba(hex, a = 255) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1],16), parseInt(r[2],16), parseInt(r[3],16), a] : [128,128,128,a];
}

export default function BuildingMap({ showHexLayer }) {
  const mapDiv         = useRef(null);
  const viewRef        = useRef(null);
  const hexLayerRef    = useRef(null);
  const readyRef       = useRef(null); // resolves when init is done
  const [activeBasemap, setActiveBasemap] = useState('satellite');

  /* ── Init map once ── */
  useEffect(() => {
    let view;
    let resolveReady;
    readyRef.current = new Promise(res => { resolveReady = res; });

    async function init() {
      const [
        { default: Map },
        { default: MapView },
        { default: GraphicsLayer },
        { default: GeoJSONLayer },
        { default: Graphic },
        { default: Polygon },
        { default: shp },
      ] = await Promise.all([
        import('@arcgis/core/Map'),
        import('@arcgis/core/views/MapView'),
        import('@arcgis/core/layers/GraphicsLayer'),
        import('@arcgis/core/layers/GeoJSONLayer'),
        import('@arcgis/core/Graphic'),
        import('@arcgis/core/geometry/Polygon'),
        import('shpjs'),
      ]);

      /* Escombros_UNDP hexagon grid (1ha cells) — debris & population estimate.
         escombros_undp.zip (~400KB) bundles the shapefile plus an ArcGIS field-
         legend json; shpjs returns an array with both, so pick the FeatureCollection. */
      const parsed = await shp(`${import.meta.env.BASE_URL}data/escombros_undp.zip`);
      const hexFC = (Array.isArray(parsed) ? parsed : [parsed])
        .find(item => item && item.type === 'FeatureCollection');

      /* Bivariate class (debris_sum × population) computed client-side, ported
         from the ArcGIS Pro Arcade expression — see utils/classify.js. */
      hexFC.features.forEach(f => {
        f.properties.biv_class = getBivariateClass(f.properties.debris_sum, f.properties.population);
      });

      const hexBlobUrl = URL.createObjectURL(
        new Blob([JSON.stringify(hexFC)], { type: 'application/json' })
      );

      const hexLayer = new GeoJSONLayer({
        title: 'Debris & Population Density',
        url: hexBlobUrl,
        visible: true,
        opacity: 0.8,
        outFields: ['*'],
        renderer: {
          type: 'unique-value',
          field: 'biv_class',
          defaultSymbol: { type: 'simple-fill', color: toRgba('#94a3b8', 60), outline: { color: [110,110,110,150], width: 0.5 } },
          uniqueValueInfos: BIVARIATE_CLASSES.map(c => ({
            value: c.id,
            symbol: { type: 'simple-fill', color: toRgba(c.color, 210), outline: { color: [110,110,110,150], width: 0.5 } },
          })),
        },
        popupTemplate: {
          title: 'Hexágono {hex_id}',
          content: `<div style="font-size:13px;line-height:1.7">
            <b>Buildings:</b> {n_bldg}<br/>
            <b>Debris volume:</b> {debris_sum} m³<br/>
            <b>Personal property debris:</b> {pp_sum} m³<br/>
            <b>Population:</b> {population}<br/>
          </div>`,
        },
      });

      /* Assessment-area boundary — context outline, no fill */
      const boundaryLayer = new GraphicsLayer({ title: 'Assessment Area' });
      try {
        const maskRes = await fetch(`${import.meta.env.BASE_URL}data/valid_area_mask.geojson`);
        const maskGeoJSON = await maskRes.json();
        maskGeoJSON.features.forEach(f => {
          boundaryLayer.add(new Graphic({
            geometry: new Polygon({
              rings: f.geometry.coordinates,
              spatialReference: { wkid: 4326 },
            }),
            symbol: {
              type: 'simple-fill',
              color: [0, 0, 0, 0],
              outline: { color: [250, 204, 21, 200], width: 1.5, style: 'dash' },
            },
          }));
        });
      } catch (err) {
        console.error('Failed to load assessment area boundary', err);
      }

      const map = new Map({ basemap: 'satellite', layers: [hexLayer, boundaryLayer] });

      view = new MapView({
        container: mapDiv.current,
        map,
        center: [-66.95, 10.58],
        zoom: 11,
        ui: { components: ['zoom', 'compass'] },
      });

      await view.when();
      await hexLayer.when();
      if (hexLayer.fullExtent) {
        view.goTo(hexLayer.fullExtent.expand(1.1)).catch(() => {});
      }

      viewRef.current    = view;
      hexLayerRef.current = hexLayer;
      resolveReady();
    }

    init().catch(console.error);

    return () => { if (view) view.destroy(); };
  }, []);

  /* ── Basemap swap ── */
  useEffect(() => {
    if (!readyRef.current) return;
    readyRef.current.then(() => {
      viewRef.current.map.basemap = BASEMAPS[activeBasemap].id;
    });
  }, [activeBasemap]);

  /* ── Hex layer toggle ── */
  useEffect(() => {
    if (!readyRef.current) return;
    readyRef.current.then(() => {
      hexLayerRef.current.visible = showHexLayer;
    });
  }, [showHexLayer]);

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <div ref={mapDiv} style={{ flex: 1, minHeight: 0 }} />
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
