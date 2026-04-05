import React from 'react';

export default function StatsPanel({ algo, nodesEvaluated, timeTakenMs, p1Score, p2Score }) {
  const accent = algo === 'greedy' ? 'var(--color-p1)' : algo === 'minimax' ? 'var(--color-p2)' : 'var(--color-p3)';
  
  return (
    <div style={{
      borderTop: `2px solid ${accent}`,
      padding: '0.5rem',
      fontFamily: 'monospace',
      fontSize: '0.8rem',
      color: 'var(--text-primary)',
      backgroundColor: 'rgba(0,0,0,0.2)',
      minHeight: '80px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>NODES EVAL:</span>
        <span>{nodesEvaluated || 0}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>TIME TAKEN:</span>
        <span>{timeTakenMs || 0}ms</span>
      </div>
      {(p1Score !== undefined) && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>P1 SCORE: {p1Score !== undefined ? p1Score : 0}</span>
          <span>P2 SCORE: {p2Score !== undefined ? p2Score : 0}</span>
        </div>
      )}
    </div>
  );
}
