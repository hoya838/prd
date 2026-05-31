"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { motion, type PanInfo } from "framer-motion";
import { Lock, Unlock, Layers, ExternalLink } from "lucide-react";
import type { GraphNode, GraphEdge } from "@/app/api/projects/[project]/graph/route";
import type { ProjectInfo } from "@/app/api/projects/route";

const SCREEN_W = 180;
const SCREEN_H = 80;
const MODAL_W  = 150;
const MODAL_H  = 60;

// AI timeline pastels adapted for dark canvas
const ROLE_COLOR: Record<string, { border: string; bg: string; badgeBg: string; badgeText: string }> = {
  user:   { border: "#9fbbe0", bg: "rgba(159,187,224,0.06)", badgeBg: "rgba(159,187,224,0.15)", badgeText: "#9fbbe0" },
  shared: { border: "#c0a8dd", bg: "rgba(192,168,221,0.06)", badgeBg: "rgba(192,168,221,0.15)", badgeText: "#c0a8dd" },
  admin:  { border: "#dfa88f", bg: "rgba(223,168,143,0.06)", badgeBg: "rgba(223,168,143,0.15)", badgeText: "#dfa88f" },
  seller: { border: "#9fc9a2", bg: "rgba(159,201,162,0.06)", badgeBg: "rgba(159,201,162,0.15)", badgeText: "#9fc9a2" },
  modal:  { border: "rgba(255,255,255,0.12)", bg: "rgba(255,255,255,0.03)", badgeBg: "rgba(255,255,255,0.08)", badgeText: "#555" },
};

function getColor(node: GraphNode) {
  if (node.type === "modal") return ROLE_COLOR.modal;
  return ROLE_COLOR[node.role] ?? ROLE_COLOR.user;
}

function ConnectionSvg({ edges, nodes, size }: { edges: GraphEdge[]; nodes: GraphNode[]; size: { width: number; height: number } }) {
  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      width={size.width}
      height={size.height}
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.2)" />
        </marker>
      </defs>
      {edges.map((edge, i) => {
        const from = nodes.find((n) => n.id === edge.from);
        const to   = nodes.find((n) => n.id === edge.to);
        if (!from || !to) return null;

        const isModal = edge.label === "modal";
        const fw = from.type === "modal" ? MODAL_W : SCREEN_W;
        const fh = from.type === "modal" ? MODAL_H : SCREEN_H;
        const tw = to.type  === "modal" ? MODAL_W : SCREEN_W;
        const th = to.type  === "modal" ? MODAL_H : SCREEN_H;

        const sx = from.position.x + fw;
        const sy = from.position.y + fh / 2;
        const ex = to.position.x;
        const ey = to.position.y + th / 2;

        let path: string;
        if (isModal) {
          path = `M${from.position.x + fw / 2},${from.position.y + fh} L${to.position.x + tw / 2},${to.position.y}`;
        } else {
          const cpx1 = sx + (ex - sx) * 0.5;
          const cpx2 = ex - (ex - sx) * 0.5;
          path = `M${sx},${sy} C${cpx1},${sy} ${cpx2},${ey} ${ex},${ey}`;
        }

        return (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={isModal ? 1 : 1.5}
            strokeDasharray={edge.dashed ? "5,4" : "none"}
            strokeLinecap="round"
            opacity={isModal ? 0.5 : 0.8}
            markerEnd="url(#arrow)"
          />
        );
      })}
    </svg>
  );
}

export function ScreenFlowView({ project }: { project: ProjectInfo }) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [contentSize, setContentSize] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/projects/${encodeURIComponent(project.name)}/graph`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setNodes(d.nodes);
        setEdges(d.edges);
        const maxX = d.canvasSize?.width  ?? Math.max(...d.nodes.map((n: GraphNode) => n.position.x + SCREEN_W)) + 60;
        const maxY = d.canvasSize?.height ?? Math.max(...d.nodes.map((n: GraphNode) => n.position.y + SCREEN_H)) + 60;
        setContentSize({ width: Math.max(maxX, 900), height: Math.max(maxY, 500) });
      })
      .catch(() => setError("그래프 로드 실패"))
      .finally(() => setLoading(false));
  }, [project.name]);

  const handleDragStart = (id: string) => {
    setDragging(id);
    const node = nodes.find((n) => n.id === id);
    if (node) dragStart.current = { x: node.position.x, y: node.position.y };
  };

  const handleDrag = (id: string, { offset }: PanInfo) => {
    if (dragging !== id || !dragStart.current) return;
    const x = Math.max(0, dragStart.current.x + offset.x);
    const y = Math.max(0, dragStart.current.y + offset.y);
    flushSync(() => {
      setNodes((prev) => prev.map((n) => n.id === id ? { ...n, position: { x, y } } : n));
    });
    setContentSize((prev) => ({
      width:  Math.max(prev.width,  x + SCREEN_W + 60),
      height: Math.max(prev.height, y + SCREEN_H + 60),
    }));
  };

  const roles = ["all", ...Array.from(new Set(nodes.filter(n => n.type === "screen").map(n => n.role)))];
  const visibleNodes = filter === "all" ? nodes : nodes.filter(n => n.role === filter || n.type === "modal");
  const visibleIds   = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = edges.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to));

  if (loading) return <div className="flex items-center justify-center h-full" style={{ fontSize: 14, color: "#444", background: "#000" }}>그래프 로딩 중...</div>;
  if (error)   return <div className="flex items-center justify-center h-full" style={{ fontSize: 14, color: "#cf2d56", background: "#000" }}>{error}</div>;
  if (nodes.length === 0) return <div className="flex items-center justify-center h-full" style={{ fontSize: 14, color: "#444", background: "#000" }}>IA_Structure.csv 없음</div>;

  const screenCount = nodes.filter(n => n.type === "screen").length;
  const modalCount  = nodes.filter(n => n.type === "modal").length;

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-2.5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#000" }}>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" style={{ color: "#444" }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase" }}>화면 플로우</span>
        </div>

        <div className="flex items-center gap-1 ml-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              style={{
                padding: "4px 12px",
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 500,
                background: filter === r ? "#fff" : "transparent",
                color:      filter === r ? "#000" : "#555",
                border:     "none",
                cursor:     "pointer",
                transition: "all 0.15s",
                letterSpacing: "-0.11px",
              }}
            >
              {r === "all" ? "전체" : r}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4" style={{ fontSize: 10, color: "#444" }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: "#9fbbe0" }} />화면 {screenCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: "#262626" }} />모달 {modalCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t border-dashed" style={{ borderColor: "rgba(255,255,255,0.15)" }} />파생/인증
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto" style={{ background: "#0a0a0a" }}>
          <div className="relative" style={{ minWidth: contentSize.width, minHeight: contentSize.height }}>
            <ConnectionSvg edges={visibleEdges} nodes={visibleNodes} size={contentSize} />

            {visibleNodes.map((node) => {
              const isModal    = node.type === "modal";
              const w          = isModal ? MODAL_W : SCREEN_W;
              const h          = isModal ? MODAL_H : SCREEN_H;
              const color      = getColor(node);
              const isSelected = selected?.id === node.id;

              return (
                <motion.div
                  key={node.id}
                  drag
                  dragMomentum={false}
                  dragConstraints={{ left: 0, top: 0, right: 100000, bottom: 100000 }}
                  onDragStart={() => handleDragStart(node.id)}
                  onDrag={(_, info) => handleDrag(node.id, info)}
                  onDragEnd={() => { setDragging(null); dragStart.current = null; }}
                  style={{ x: node.position.x, y: node.position.y, width: w, transformOrigin: "0 0" }}
                  className="absolute cursor-grab"
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  whileHover={{ scale: 1.03, zIndex: 10 }}
                  whileDrag={{ scale: 1.05, zIndex: 50, cursor: "grabbing" }}
                >
                  <div
                    onClick={() => setSelected(isSelected ? null : node)}
                    className="w-full p-2.5 cursor-pointer transition-all"
                    style={{
                      height: h,
                      borderRadius: 12,
                      background: isSelected ? "#1a1a1a" : color.bg,
                      border: isSelected
                        ? "1px solid rgba(255,255,255,0.25)"
                        : `1px solid ${color.border}`,
                      opacity: isModal ? 0.7 : 1,
                      boxShadow: isSelected ? "0 0 0 1px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.4)" : "none",
                    }}
                  >
                    <div className="flex items-start justify-between gap-1 h-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          {isModal ? (
                            <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, fontWeight: 600, background: color.badgeBg, color: color.badgeText }}>
                              modal
                            </span>
                          ) : (
                            <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, fontWeight: 600, background: color.badgeBg, color: color.badgeText }}>
                              {node.role}
                            </span>
                          )}
                          {node.authRequired  && <Lock   className="w-2.5 h-2.5 shrink-0" style={{ color: "#c08532" }} />}
                          {!node.authRequired && !isModal && <Unlock className="w-2.5 h-2.5 shrink-0" style={{ color: "#262626" }} />}
                        </div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{node.label}</p>
                        {!isModal && <p style={{ fontSize: 9, color: "#444", marginTop: 2, fontFamily: "var(--font-mono)" }}>{node.id}</p>}
                      </div>
                      {isSelected && <ExternalLink className="w-3 h-3 shrink-0 mt-0.5" style={{ color: "#555" }} />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="w-72 shrink-0 overflow-y-auto"
            style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", background: "#0a0a0a" }}
          >
            <div className="flex items-start justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>{selected.type} · {selected.role}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "4px 0 0" }}>{selected.label}</p>
                <p style={{ fontSize: 11, color: "#444", margin: "2px 0 0", fontFamily: "var(--font-mono)" }}>{selected.id}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ color: "#444", background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1, marginTop: 2, padding: 4 }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#444")}
              >×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                {selected.authRequired ? (
                  <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 100, border: "1px solid rgba(192,133,50,0.3)", color: "#c08532", background: "rgba(192,133,50,0.1)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    🔒 로그인 필요
                  </span>
                ) : (
                  <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)", color: "#555", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    공개
                  </span>
                )}
              </div>
              {selected.description && (
                <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, margin: 0 }}>{selected.description}</p>
              )}
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#333", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>연결 화면</p>
                <div className="space-y-1">
                  {edges
                    .filter(e => e.from === selected.id || e.to === selected.id)
                    .map((e, i) => {
                      const other = nodes.find(n => n.id === (e.from === selected.id ? e.to : e.from));
                      if (!other) return null;
                      const otherColor = getColor(other);
                      return (
                        <button
                          key={i}
                          onClick={() => setSelected(other)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                          style={{ borderRadius: 8, background: "transparent", border: "none", cursor: "pointer" }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                        >
                          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", background: otherColor.badgeBg, color: otherColor.badgeText, flexShrink: 0 }}>
                            {other.role}
                          </span>
                          <span style={{ fontSize: 12, color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{other.label}</span>
                          <span style={{ fontSize: 9, color: "#333", flexShrink: 0 }}>{e.from === selected.id ? "→" : "←"} {e.label}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
