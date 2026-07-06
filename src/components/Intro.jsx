import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import './Intro.css';

export default function Intro({ onDone }) {
  const [phase, setPhase] = useState('enter'); // enter → hold → exit

  useEffect(() => {
    const hold = setTimeout(() => setPhase('exit'), 1800);
    const done = setTimeout(() => onDone(), 2600);
    return () => { clearTimeout(hold); clearTimeout(done); };
  }, [onDone]);

  return (
    <div className={`intro-overlay intro-${phase}`}>
      <img src={logo} alt="Logo" className="intro-logo" />
      <p className="intro-title">Debris Estimate Dashboard</p>
    </div>
  );
}
