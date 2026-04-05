import React, { useMemo, useState } from 'react';

export default function StateTree({ tree, chosenIndex, playerColors }) {
  const [scale, setScale] = useState(1);
  const svgWidth = 800;
  const svgHeight = 400;

  const renderNode = (node, x, y, dx, level, isChosenPath, isOptimalBranch = false) => {
    if (!node) return null;

    const isRoot = level === 0;
    const radius = isRoot ? 12 : 15;
    const color = isRoot ? 'var(--text-primary)' : playerColors[node.player] || 'white';
    
    const childrenNodes = [];
    if (node.children && node.children.length > 0) {
      const childCount = node.children.length;
      const childSpacing = dx / Math.max(1, childCount);
      const startX = x - dx / 2 + childSpacing / 2;
      const childY = y + 100;

      node.children.forEach((child, i) => {
        const childX = startX + i * childSpacing;
        const isChildChosen = isChosenPath && child.move === chosenIndex;
        const childIsOptimal = isRoot && i === 0;
        const lineOpacity = isChosenPath ? (isChildChosen ? 1 : childIsOptimal ? 0.8 : 0.4) : 0.4;
        const strokeColor = isChildChosen ? 'white' : childIsOptimal ? 'var(--color-p2)' : 'var(--text-secondary)';
        
        childrenNodes.push(
          <line
            key={`line-${level}-${i}`}
            x1={x} y1={y + radius}
            x2={childX} y2={childY - radius}
            stroke={strokeColor}
            strokeWidth={isChildChosen ? 2 : childIsOptimal ? 3 : 1}
            opacity={lineOpacity}
          />
        );
        childrenNodes.push(
          renderNode(child, childX, childY, childSpacing * 0.9, level + 1, isChildChosen, childIsOptimal)
        );
      });
    }

    const nodeOpacity = isChosenPath ? 1 : 0.8;

    return (
      <g key={`node-${level}-${x}`}>
        {childrenNodes}
        {isRoot ? (
          <polygon points={`${x},${y-radius} ${x-radius},${y+radius} ${x+radius},${y+radius}`} fill={color} opacity={nodeOpacity} />
        ) : (
          <circle cx={x} cy={y} r={radius} fill={color} opacity={nodeOpacity} />
        )}
        {!isRoot && (
          <text x={x} y={y + 4} textAnchor="middle" fill="var(--bg-color)" fontSize="10px" fontWeight="bold" opacity={nodeOpacity}>
            {node.move}
          </text>
        )}
        {!isRoot && (
          <text x={x} y={y + radius + 15} textAnchor="middle" fill="var(--text-secondary)" fontSize="10px" opacity={nodeOpacity}>
            Score: {Math.round(node.estimatedScore)}
          </text>
        )}
        {!isRoot && node.value !== null && node.value !== undefined && (
          <text x={x} y={y - radius - 5} textAnchor="middle" fill={color} fontSize="10px" fontWeight="bold" opacity={nodeOpacity}>
            v{node.value}
          </text>
        )}
        {!isRoot && isOptimalBranch && (
          <text x={x} y={y - radius - 20} textAnchor="middle" fill="var(--color-p2)" fontSize="12px" fontWeight="bold" opacity={nodeOpacity}>
            ✨ BEST
          </text>
        )}
      </g>
    );
  };

  const renderedTree = useMemo(() => {
    if (!tree) return null;
    return renderNode(tree, svgWidth / 2, 40, svgWidth * 0.9, 0, true);
  }, [tree, chosenIndex, playerColors]);

  if (!tree) return null;

  return (
    <div className="state-tree-container" style={{ position: 'relative', width: '100%', minHeight: '200px', flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', borderLeft: '1px solid var(--border-color)', overflow: 'auto' }}>
      <div style={{ position: 'sticky', top: '10px', left: '10px', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
        <button onClick={() => setScale(s => Math.max(0.2, s - 0.2))} style={{ padding: '0.2rem 0.5rem', fontSize: '0.6rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}>- ZOOM</button>
        <button onClick={() => setScale(s => Math.min(3.0, s + 0.2))} style={{ padding: '0.2rem 0.5rem', fontSize: '0.6rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}>+ ZOOM</button>
      </div>
      <svg width={svgWidth * scale} height={svgHeight * scale} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ transformOrigin: 'top left', minWidth: '100%' }}>
        {renderedTree}
      </svg>
    </div>
  );
}
