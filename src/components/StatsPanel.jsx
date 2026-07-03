import { CATEGORIES, getCategory } from '../utils/classify';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StatsPanel({ buildings, activeCategories, onToggle, isOpen, onTogglePanel }) {
  const counts = CATEGORIES.map(cat => ({
    ...cat,
    count: buildings.filter(b => getCategory(b.floors).id === cat.id).length,
  }));

  const filteredBuildings = buildings.filter(b =>
    activeCategories.includes(getCategory(b.floors).id)
  );

  return (
    <>
      <button className="panel-toggle-btn" onClick={onTogglePanel} aria-label="Toggle panel">
        {isOpen ? '✕' : '☰'}
      </button>

      <aside className={`stats-panel ${isOpen ? 'open' : 'closed'}`}>
        <div className="panel-scroll">
          <h2 className="panel-title">Building Floor Classification</h2>
          <p className="panel-sub">{buildings.length} buildings inspected</p>

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
        </div>
      </aside>
    </>
  );
}
