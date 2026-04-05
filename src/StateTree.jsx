import React, { useMemo } from 'react';

export default function StateTree({ tree, chosenIndex, playerColors }) {
  const svgWidth = 800;
  const svgHeight = 400;

  const renderNode = (node, x, y, dx, level, isChosenPath) => {
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
        const lineOpacity = isChosenPath ? (isChildChosen ? 1 : 0.2) : 0.1;
        const strokeColor = isChildChosen ? 'white' : 'var(--text-secondary)';
        
        childrenNodes.push(
          <line
            key={`line-${level}-${i}`}
            x1={x} y1={y + radius}
            x2={childX} y2={childY - radius}
            stroke={strokeColor}
            strokeWidth={isChildChosen ? 2 : 1}
            opacity={lineOpacity}
          />
        );
        childrenNodes.push(
          renderNode(child, childX, childY, childSpacing * 0.9, level + 1, isChildChosen)
        );
      });
    }

    const nodeOpacity = isChosenPath ? 1 : 0.3;

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
      </g>
    );
  };

  const renderedTree = useMemo(() => {
    if (!tree) return null;
    return renderNode(tree, svgWidth / 2, 40, svgWidth * 0.9, 0, true);
  }, [tree, chosenIndex, playerColors]);

  if (!tree) return null;

  return (
    <div className="state-tree-container" style={{ width: '100%', minHeight: '200px', flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', borderLeft: '1px solid var(--border-color)', overflowY: 'auto' }}>
      <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMin meet">
        {renderedTree}
      </svg>
    </div>
  );
}
