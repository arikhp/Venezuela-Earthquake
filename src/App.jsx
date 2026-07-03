import { useState } from 'react';
import buildings from './buildings.json';
import { CATEGORIES } from './utils/classify';
import StatsPanel from './components/StatsPanel';
import BuildingMap from './components/BuildingMap';
import './App.css';

export default function App() {
  const [activeCategories, setActiveCategories] = useState(CATEGORIES.map(c => c.id));

  function toggleCategory(id) {
    setActiveCategories(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(c => c !== id) : prev
        : [...prev, id]
    );
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="topbar-inner">
          <h1 className="topbar-title">Building Inspection Dashboard</h1>
          <span className="topbar-sub">Floor Classification &amp; Geographic Distribution</span>
        </div>
      </header>
      <main className="main-layout">
        <StatsPanel
          buildings={buildings}
          activeCategories={activeCategories}
          onToggle={toggleCategory}
        />
        <BuildingMap
          buildings={buildings}
          activeCategories={activeCategories}
        />
      </main>
    </div>
  );
}
