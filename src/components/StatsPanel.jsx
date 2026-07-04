export default function StatsPanel({
  affectedBuildings, showAffectedLayer, onToggleAffectedLayer,
  isOpen, onTogglePanel,
}) {
  const collapsedCount  = affectedBuildings.filter(b => b.status === 'COLAPSO').length;
  const emergencyCount  = affectedBuildings.filter(b => b.status === 'EMERGENCIA').length;

  return (
    <>
      <button className="panel-toggle-btn" onClick={onTogglePanel} aria-label="Toggle panel">
        {isOpen ? '✕' : '☰'}
      </button>

      <aside className={`stats-panel ${isOpen ? 'open' : 'closed'}`}>
        <div className="panel-scroll">

          {/* ── Affected Buildings (shapefile survey) ── */}
          <div className="layer-header">
            <span className="layer-dot affected-dot" />
            <h2 className="panel-title">Affected Buildings</h2>
            <span className="layer-badge">{affectedBuildings.length}</span>
            <button
              className={`layer-toggle ${showAffectedLayer ? 'on' : 'off'}`}
              onClick={onToggleAffectedLayer}
            >
              {showAffectedLayer ? 'ON' : 'OFF'}
            </button>
          </div>
          <p className="panel-sub">Building footprint survey (shapefile)</p>

          <div className="category-filters">
            <div className="cat-btn active" style={{ '--cat-color': '#a855f7', opacity: showAffectedLayer ? 1 : 0.35 }}>
              <span className="cat-dot" style={{ background: '#a855f7' }} />
              <span className="cat-label">Surveyed structure</span>
              <span className="cat-count">{affectedBuildings.length - collapsedCount - emergencyCount}</span>
            </div>
            <div className="cat-btn active" style={{ '--cat-color': '#f97316', opacity: showAffectedLayer ? 1 : 0.35 }}>
              <span className="cat-dot" style={{ background: '#f97316' }} />
              <span className="cat-label">Emergency</span>
              <span className="cat-count">{emergencyCount}</span>
            </div>
            <div className="cat-btn active" style={{ '--cat-color': '#dc2626', opacity: showAffectedLayer ? 1 : 0.35 }}>
              <span className="cat-dot" style={{ background: '#dc2626' }} />
              <span className="cat-label">Collapsed</span>
              <span className="cat-count">{collapsedCount}</span>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
