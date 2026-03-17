import React, { useEffect, useState } from "react";

export default function GameOver({ scores, winner, onPlayAgain, onExit }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // trigger dramatic entrance after mount
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      backgroundColor: animate ? 'rgba(0,0,0,0.8)' : 'transparent',
      transition: 'background-color 1s ease',
      zIndex: 100,
      position: 'absolute',
      inset: 0
    }}>
      <h2 className="heading-oswald" style={{ 
        fontSize: '3rem', 
        marginBottom: '2rem',
        opacity: animate ? 1 : 0,
        transform: animate ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.5s ease 0.2s',
        color: winner ? (winner === 1 ? 'var(--color-p1)' : winner === 2 ? 'var(--color-p2)' : 'var(--color-p3)') : 'white'
      }}>
        {winner ? `PLAYER ${winner} WINS` : 'TIE GAME'}
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '3rem',
        opacity: animate ? 1 : 0,
        transition: 'opacity 0.5s ease 0.5s',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
          Final Scores (Lowest Wins)
        </div>
        {Object.entries(scores).map(([player, score]) => (
          <div key={player} style={{ 
            fontSize: '1.5rem', 
            fontWeight: winner === Number(player) ? 'bold' : 'normal',
            color: player === '1' ? 'var(--color-p1)' : player === '2' ? 'var(--color-p2)' : 'var(--color-p3)'
          }}>
            PLAYER {player}: {score}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <button 
          style={{ opacity: animate ? 1 : 0, transition: 'opacity 0.5s ease 1s' }}
          onClick={onPlayAgain}
        >
          PLAY AGAIN
        </button>
        <button 
          style={{ opacity: animate ? 1 : 0, transition: 'opacity 0.5s ease 1s' }}
          onClick={onExit}
        >
          EXIT TO MENU
        </button>
      </div>

      {/* Adding some global black hole animation overrides */}
      <style>{`
        /* When hovering/selecting the game over blackhole styles:
           This would usually be managed in Board.jsx by passing the blackHoleIndex, 
           but applying a global override for specific gameover logic is fine if 
           app is structured as a full overlay right now.
           Wait, App.jsx renders GameOver ON TOP OF the board or INSTEAD OF? 
           App.jsx conditionally renders it INSTEAD of Board.jsx! 
           Let's fix that so we can see the board! */
      `}</style>
    </div>
  );
}
