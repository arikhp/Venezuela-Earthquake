import { CATEGORIES, getCategory } from '../utils/classify';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StatsPanel({
  buildings, activeCategories, onToggle,
  affectedBuildings, showAffectedLayer, onToggleAffectedLayer,
  isOpen, onTogglePanel,
}) {
  const counts = CATEGORIES.map(cat => ({
    ...cat,
    count: buildings.filter(b => getCategory(b.floors).id === cat.id).length,
  }));

  const filteredBuildings = buildings.filter(b =>
    activeCategories.includes(getCategory(b.floors).id)
  );

  const collapsedCount  = affectedBuildings.filter(b => b.status === 'COLAPSO').length;
  const emergencyCount  = affectedBuildings.filter(b => b.status === 'EMERGENCIA').length;

  return (
    <>
      <button className="panel-toggle-btn" onClick={onTogglePanel} aria-label="Toggle panel">
        {isOpen ? '✕' : '☰'}
      </button>

      <aside className={`stats-panel ${isOpen ? 'open' : 'closed'}`}>
        <div className="panel-scroll">

          {/* ── Layer 1: Field Inspections ── */}
          <div className="layer-header">
            <span className="layer-dot insp-dot" />
            <h2 className="panel-title">Field Inspections</h2>
            <span className="layer-badge">{buildings.length}</span>
          </div>
          <p className="panel-sub">Official building inspections</p>

          <div className="category-filters">
            {counts.map(cat => (
              <button
                key={cat.id}
                className={`cat-btn ${activeCategories.includes(cat.id) ? 'active' : 'inactive'}`}
                style={{ '--cat-color': cat.color }}
                onClick={() => onToggle(cat.id)}
              >
                <span className="cat-dot" style={{ background: cat.color }} />
                <span className="cat-label">{cat.label}</span>
                <span className="cat-count">{cat.count}</span>
              </button>
            ))}
          </div>

          <div className="chart-section">
            <h3 className="chart-title">Distribution by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={counts} dataKey="count" nameKey="label"
                  cx="50%" cy="45%" outerRadius={80} innerRadius={36}>
                  {counts.map(cat => (
                    <Cell key={cat.id} fill={cat.color}
                      opacity={activeCategories.includes(cat.id) ? 1 : 0.25} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [v + ' buildings', n]}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-num">{filteredBuildings.length}</span>
              <span className="summary-lbl">Shown on map</span>
            </div>
            <div className="summary-card">
              <span className="summary-num">
                {filteredBuildings.length
                  ? Math.round(filteredBuildings.reduce((s, b) => s + b.floors, 0) / filteredBuildings.length)
                  : 0}
              </span>
              <span className="summary-lbl">Avg. floors</span>
            </div>
            <div className="summary-card">
              <span className="summary-num">
                {filteredBuildings.length ? Math.max(...filteredBuildings.map(b => b.floors)) : 0}
              </span>
              <span className="summary-lbl">Max floors</span>
            </div>
          </div>

          <div className="layer-divider" />

          {/* ── Layer 2: Affected Buildings (KML survey) ── */}
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
          <p className="panel-sub">Building footprint survey (KML)</p>

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
