import { useState, useCallback } from 'react';
import logo from './assets/logo.png';
import hexSummary from './hex_summary.json';
import StatsPanel from './components/StatsPanel';
import BuildingMap from './components/BuildingMap';
import Intro from './components/Intro';
import './App.css';

export default function App() {
  const [showHexLayer, setShowHexLayer] = useState(true);
  const [panelOpen, setPanelOpen]       = useState(true);
  const [introDone, setIntroDone]       = useState(false);

  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  return (
    <>
      {!introDone && <Intro onDone={handleIntroDone} />}
      <div className="dashboard">
        <header className="topbar">
          <div className="topbar-inner">
            <img src={logo} alt="Logo" className="topbar-logo" />
            <div>
              <h1 className="topbar-title">Debris Estimate Dashboard</h1>
              <span className="topbar-sub">UNDP Hexagon Grid &middot; Debris &amp; Population Density</span>
            </div>
          </div>
        </header>
        <main className="main-layout">
          <StatsPanel
            hexSummary={hexSummary}
            showHexLayer={showHexLayer}
            onToggleHexLayer={() => setShowHexLayer(p => !p)}
            isOpen={panelOpen}
            onTogglePanel={() => setPanelOpen(p => !p)}
          />
          <BuildingMap showHexLayer={showHexLayer} />
        </main>
      </div>
    </>
  );
}
