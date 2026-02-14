import React, { useMemo, useRef, useState } from "react";
import { KnowledgeNode, KnowledgeEdge } from "@/hooks/useDashboardData";

interface KnowledgeGraphProps {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

const TYPE_COLORS: Record<string, string> = {
  subject: "hsl(var(--primary))",
  kind: "hsl(var(--accent-foreground) / 0.7)",
  category: "hsl(var(--muted-foreground) / 0.6)",
  domain: "hsl(var(--destructive) / 0.7)",
};

const TYPE_LABELS: Record<string, string> = {
  subject: "People / Entities",
  kind: "Knowledge Types",
  category: "Categories",
  domain: "Domains",
};

interface LayoutNode extends KnowledgeNode {
  x: number;
  y: number;
  radius: number;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ nodes, edges }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: LayoutNode } | null>(null);

  const WIDTH = 700;
  const HEIGHT = 450;
  const CX = WIDTH / 2;
  const CY = HEIGHT / 2;

  // Layout: cluster by type in quadrants
  const layoutNodes = useMemo(() => {
    const typeGroups: Record<string, KnowledgeNode[]> = {};
    for (const n of nodes) {
      if (!typeGroups[n.type]) typeGroups[n.type] = [];
      typeGroups[n.type].push(n);
    }

    const typeOffsets: Record<string, { cx: number; cy: number }> = {
      subject: { cx: CX - 140, cy: CY - 80 },
      kind: { cx: CX + 140, cy: CY - 80 },
      category: { cx: CX + 140, cy: CY + 100 },
      domain: { cx: CX - 140, cy: CY + 100 },
    };

    const result: LayoutNode[] = [];

    for (const [type, group] of Object.entries(typeGroups)) {
      const offset = typeOffsets[type] || { cx: CX, cy: CY };
      const angleStep = (2 * Math.PI) / Math.max(group.length, 1);
      const clusterRadius = Math.min(80, 30 + group.length * 12);

      group.forEach((n, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const radius = Math.max(12, Math.min(30, 10 + n.count * 3));
        result.push({
          ...n,
          x: offset.cx + Math.cos(angle) * clusterRadius,
          y: offset.cy + Math.sin(angle) * clusterRadius,
          radius,
        });
      });
    }

    return result;
  }, [nodes]);

  const nodeById = useMemo(() => {
    const map = new Map<string, LayoutNode>();
    for (const n of layoutNodes) map.set(n.id, n);
    return map;
  }, [layoutNodes]);

  const activeEdges = useMemo(() => {
    if (!hoveredNode) return [];
    return edges.filter(e => e.source === hoveredNode || e.target === hoveredNode);
  }, [edges, hoveredNode]);

  const connectedNodes = useMemo(() => {
    const set = new Set<string>();
    for (const e of activeEdges) {
      set.add(e.source);
      set.add(e.target);
    }
    return set;
  }, [activeEdges]);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No knowledge connections to visualize yet
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto max-h-[450px]"
        style={{ background: "transparent" }}
      >
        {/* Edges - only show on hover */}
        {activeEdges.map((edge, i) => {
          const src = nodeById.get(edge.source);
          const tgt = nodeById.get(edge.target);
          if (!src || !tgt) return null;
          return (
            <line
              key={`edge-${i}`}
              x1={src.x}
              y1={src.y}
              x2={tgt.x}
              y2={tgt.y}
              stroke="hsl(var(--primary) / 0.3)"
              strokeWidth={Math.max(1, edge.weight * 0.8)}
              strokeDasharray="4 2"
            />
          );
        })}

        {/* Nodes */}
        {layoutNodes.map((node) => {
          const isHovered = hoveredNode === node.id;
          const isConnected = connectedNodes.has(node.id);
          const dimmed = hoveredNode && !isHovered && !isConnected;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => {
                setHoveredNode(node.id);
                setTooltip({ x: node.x, y: node.y, node });
              }}
              onMouseLeave={() => {
                setHoveredNode(null);
                setTooltip(null);
              }}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              opacity={dimmed ? 0.25 : 1}
            >
              <circle
                r={isHovered ? node.radius + 4 : node.radius}
                fill={TYPE_COLORS[node.type] || "hsl(var(--muted))"}
                opacity={0.85}
                stroke={isHovered ? "hsl(var(--primary))" : "hsl(var(--border))"}
                strokeWidth={isHovered ? 2.5 : 1}
                style={{ transition: "all 0.2s" }}
              />
              <text
                textAnchor="middle"
                dy="0.35em"
                fontSize={Math.max(9, Math.min(13, node.radius * 0.7))}
                fill="hsl(var(--primary-foreground))"
                fontWeight={isHovered ? 700 : 500}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {node.label.length > 10 ? node.label.slice(0, 9) + "…" : node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute bg-popover text-popover-foreground border border-border rounded-lg px-3 py-2 shadow-lg text-sm pointer-events-none z-10"
          style={{
            left: `${(tooltip.x / WIDTH) * 100}%`,
            top: `${(tooltip.y / HEIGHT) * 100 - 12}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="font-semibold">{tooltip.node.label}</div>
          <div className="text-muted-foreground text-xs">
            {TYPE_LABELS[tooltip.node.type] || tooltip.node.type} · {tooltip.node.count} learnings
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {activeEdges.length} connections
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 justify-center">
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: TYPE_COLORS[type] }}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};
