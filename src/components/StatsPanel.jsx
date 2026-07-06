import { BIVARIATE_CLASSES } from '../utils/classify';

export default function StatsPanel({
  hexSummary, showHexLayer, onToggleHexLayer,
  isOpen, onTogglePanel,
}) {
  const rows = ['H', 'M', 'L']; // population, high → low (top → bottom)
  const cols = ['L', 'M', 'H']; // debris, low → high (left → right)

  return (
    <>
      <button className="panel-toggle-btn" onClick={onTogglePanel} aria-label="Toggle panel">
        {isOpen ? '✕' : '☰'}
      </button>

      <aside className={`stats-panel ${isOpen ? 'open' : 'closed'}`}>
        <div className="panel-scroll">

          {/* ── Debris & Population Density (Escombros UNDP) ── */}
          <div className="layer-header">
            <span className="layer-dot" style={{ background: '#2a1a8a' }} />
            <h2 className="panel-title">Debris &amp; Population Density</h2>
            <span className="layer-badge">{hexSummary.totalHexagons}</span>
            <button
              className={`layer-toggle ${showHexLayer ? 'on' : 'off'}`}
              onClick={onToggleHexLayer}
            >
              {showHexLayer ? 'ON' : 'OFF'}
            </button>
          </div>
          <p className="panel-sub">UNDP 1ha hexagon grid — bivariate debris volume × population</p>

          <div className="bivariate-legend" style={{ opacity: showHexLayer ? 1 : 0.35 }}>
            <span className="bivariate-axis-y">Population ↑</span>
            <div className="bivariate-body">
              <div className="bivariate-grid">
                {rows.map(p => (
                  cols.map(d => {
                    const cls = BIVARIATE_CLASSES.find(c => c.id === d + p);
                    const count = hexSummary.classCounts[d + p] || 0;
                    return (
                      <div
                        key={d + p}
                        className="bivariate-cell"
                        style={{ background: cls.color }}
                        title={`${cls.label}: ${count} hexagons`}
                      >
                        <span className="bivariate-count">{count}</span>
                      </div>
                    );
                  })
                ))}
              </div>
              <span className="bivariate-axis-x">Debris volume →</span>
            </div>
          </div>

          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-num">{hexSummary.totalBuildings.toLocaleString()}</span>
              <span className="summary-lbl">Buildings assessed</span>
            </div>
            <div className="summary-card">
              <span className="summary-num">{Math.round(hexSummary.totalDebrisM3).toLocaleString()}</span>
              <span className="summary-lbl">Debris (m³)</span>
            </div>
            <div className="summary-card">
              <span className="summary-num">{Math.round(hexSummary.totalPopulation).toLocaleString()}</span>
              <span className="summary-lbl">Population</span>
            </div>
            <div className="summary-card">
              <span className="summary-num">{Math.round(hexSummary.totalPersonalPropertyM3).toLocaleString()}</span>
              <span className="summary-lbl">Personal property (m³)</span>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
