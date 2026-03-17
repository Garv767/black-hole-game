import React from "react";

export default function Menu({ onStart }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <h1 className="heading-oswald" style={{ marginBottom: '0.5rem', textAlign: 'center' }}>BLACK HOLE</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', textAlign: 'center', maxWidth: '400px' }}>
        A strategic number placement game. The circle with the lowest sum of neighbors around the black hole wins. 
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
        <button className="menu-btn" onClick={() => onStart("pve")}>
          1 VS AI
        </button>
        <button className="menu-btn" onClick={() => onStart("pvp")}>
          1 VS 1
        </button>
        <button className="menu-btn" onClick={() => onStart("3p")}>
          3 PLAYERS
        </button>
      </div>

      <style>{`
        .menu-btn {
          width: 100%;
          font-size: 1.25rem;
          padding: 1.25rem 2rem;
          border-width: 2px;
          letter-spacing: 0.05em;
        }
        .menu-btn:hover {
          background: var(--text-primary);
          color: var(--bg-color);
        }
      `}</style>
    </div>
  );
}
