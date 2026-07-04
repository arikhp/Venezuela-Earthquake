import { useState, useCallback } from 'react';
import logo from './assets/logo.png';
import buildings from './buildings.json';
import affectedBuildings from './affected_buildings.json';
import { CATEGORIES } from './utils/classify';
import StatsPanel from './components/StatsPanel';
import BuildingMap from './components/BuildingMap';
import Intro from './components/Intro';
import './App.css';

export default function App() {
  const [activeCategories, setActiveCategories] = useState(CATEGORIES.map(c => c.id));
  const [showAffectedLayer, setShowAffectedLayer] = useState(true);
  const [panelOpen, setPanelOpen]               = useState(true);
  const [introDone, setIntroDone]               = useState(false);

  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  function toggleCategory(id) {
    setActiveCategories(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(c => c !== id) : prev
        : [...prev, id]
    );
  }

  return (
    <>
      {!introDone && <Intro onDone={handleIntroDone} />}
      <div className="dashboard">
        <header className="topbar">
          <div className="topbar-inner">
            <img src={logo} alt="Logo" className="topbar-logo" />
            <div>
              <h1 className="topbar-title">Building Inspection Dashboard</h1>
              <span className="topbar-sub">Floor Classification &amp; Geographic Distribution</span>
            </div>
          </div>
        </header>
        <main className="main-layout">
          <StatsPanel
            buildings={buildings}
            activeCategories={activeCategories}
            onToggle={toggleCategory}
            affectedBuildings={affectedBuildings}
            showAffectedLayer={showAffectedLayer}
            onToggleAffectedLayer={() => setShowAffectedLayer(p => !p)}
            isOpen={panelOpen}
            onTogglePanel={() => setPanelOpen(p => !p)}
          />
          <BuildingMap
            buildings={buildings}
            activeCategories={activeCategories}
            affectedBuildings={affectedBuildings}
            showAffectedLayer={showAffectedLayer}
          />
        </main>
      </div>
    </>
  );
}
