import { CATEGORIES, getCategory } from '../utils/classify';
import { mmiRoman, mmiLabel, MMI_LEVELS } from '../utils/mmi';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StatsPanel({
  buildings, activeCategories, onToggle,
  socialReports, showSocialLayer, onToggleSocialLayer,
  showIntensityLayer, onToggleIntensityLayer,
  isOpen, onTogglePanel,
}) {
  const counts = CATEGORIES.map(cat => ({
    ...cat,
    count: buildings.filter(b => getCategory(b.floors).id === cat.id).length,
  }));

  const filteredBuildings = buildings.filter(b =>
    activeCategories.includes(getCategory(b.floors).id)
  );

  const socialWithFloors = socialReports.filter(r => r.floors);
  const socialCounts = CATEGORIES.map(cat => ({
    ...cat,
    count: socialWithFloors.filter(r => getCategory(r.floors).id === cat.id).length,
  }));

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

          {/* ── Layer 2: Social Media Reports ── */}
          <div className="layer-header">
            <span className="layer-dot social-dot" />
            <h2 className="panel-title">Social Media Reports</h2>
            <span className="layer-badge">{socialReports.length}</span>
            <button
              className={`layer-toggle ${showSocialLayer ? 'on' : 'off'}`}
              onClick={onToggleSocialLayer}
            >
              {showSocialLayer ? 'ON' : 'OFF'}
            </button>
          </div>
          <p className="panel-sub">Crowd-sourced via Instagram, X, Facebook</p>

          <div className="category-filters">
            {socialCounts.map(cat => (
              <div
                key={cat.id}
                className="cat-btn active"
                style={{ '--cat-color': cat.color, opacity: showSocialLayer ? 1 : 0.35 }}
              >
                <span className="cat-dot" style={{ background: cat.color }} />
                <span className="cat-label">{cat.label}</span>
                <span className="cat-count">{cat.count}</span>
              </div>
            ))}
          </div>

          {socialWithFloors.length > 0 && (
            <div className="chart-section">
              <h3 className="chart-title">Distribution by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={socialCounts} dataKey="count" nameKey="label"
                    cx="50%" cy="45%" outerRadius={80} innerRadius={36}>
                    {socialCounts.map(cat => (
                      <Cell key={cat.id} fill={cat.color}
                        opacity={showSocialLayer ? 1 : 0.25} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [v + ' reports', n]}
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-num">{socialReports.filter(r => r.lat).length}</span>
              <span className="summary-lbl">With location</span>
            </div>
            <div className="summary-card">
              <span className="summary-num">{socialWithFloors.length}</span>
              <span className="summary-lbl">With floor data</span>
            </div>
            <div className="summary-card">
              <span className="summary-num">
                {socialWithFloors.length ? Math.max(...socialWithFloors.map(r => r.floors)) : '—'}
              </span>
              <span className="summary-lbl">Max floors</span>
            </div>
          </div>

          <div className="layer-divider" />

          {/* ── Layer 3: USGS ShakeMap Intensity ── */}
          <div className="layer-header">
            <span className="layer-dot shake-dot" />
            <h2 className="panel-title">USGS ShakeMap Intensity</h2>
            <button
              className={`layer-toggle ${showIntensityLayer ? 'on' : 'off'}`}
              onClick={onToggleIntensityLayer}
            >
              {showIntensityLayer ? 'ON' : 'OFF'}
            </button>
          </div>
          <p className="panel-sub">Modified Mercalli Intensity contours</p>

          <div className="category-filters">
            {MMI_LEVELS.map(l => (
              <div
                key={l.value}
                className="cat-btn active"
                style={{ '--cat-color': l.color, opacity: showIntensityLayer ? 1 : 0.35 }}
              >
                <span className="cat-dot" style={{ background: l.color }} />
                <span className="cat-label">{mmiRoman(l.value)} · {mmiLabel(l.value)}</span>
              </div>
            ))}
          </div>

        </div>
      </aside>
    </>
  );
}
