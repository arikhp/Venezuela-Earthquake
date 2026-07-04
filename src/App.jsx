import { useState, useCallback } from 'react';
import logo from './assets/logo.png';
import affectedBuildings from './affected_buildings.json';
import StatsPanel from './components/StatsPanel';
import BuildingMap from './components/BuildingMap';
import Intro from './components/Intro';
import './App.css';

export default function App() {
  const [showAffectedLayer, setShowAffectedLayer] = useState(true);
  const [panelOpen, setPanelOpen]               = useState(true);
  const [introDone, setIntroDone]               = useState(false);

  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  return (
    <>
      {!introDone && <Intro onDone={handleIntroDone} />}
      <div className="dashboard">
        <header className="topbar">
          <div className="topbar-inner">
            <img src={logo} alt="Logo" className="topbar-logo" />
            <div>
              <h1 className="topbar-title">Building Inspection Dashboard</h1>
              <span className="topbar-sub">Surveyed Buildings — Shapefile</span>
            </div>
          </div>
        </header>
        <main className="main-layout">
          <StatsPanel
            affectedBuildings={affectedBuildings}
            showAffectedLayer={showAffectedLayer}
            onToggleAffectedLayer={() => setShowAffectedLayer(p => !p)}
            isOpen={panelOpen}
            onTogglePanel={() => setPanelOpen(p => !p)}
          />
          <BuildingMap
            affectedBuildings={affectedBuildings}
            showAffectedLayer={showAffectedLayer}
          />
        </main>
      </div>
    </>
  );
}
