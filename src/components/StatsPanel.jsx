import { CATEGORIES, getCategory } from '../utils/classify';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StatsPanel({ buildings, activeCategories, onToggle }) {
  const counts = CATEGORIES.map(cat => ({
    ...cat,
    count: buildings.filter(b => getCategory(b.floors).id === cat.id).length,
  }));

  const filteredBuildings = buildings.filter(b =>
    activeCategories.includes(getCategory(b.floors).id)
  );

  return (
    <aside className="stats-panel">
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
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={counts}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={75}
              label={({ label, count }) => `${count}`}
              labelLine={false}
            >
              {counts.map(cat => (
                <Cell
                  key={cat.id}
                  fill={cat.color}
                  opacity={activeCategories.includes(cat.id) ? 1 : 0.25}
                />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [v, n]} />
            <Legend />
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
    </aside>
  );
}
