"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { motion, type PanInfo } from "framer-motion";
import { Lock, Unlock, Layers, ExternalLink } from "lucide-react";
import type { GraphNode, GraphEdge } from "@/app/api/projects/[project]/graph/route";
import type { ProjectInfo } from "@/app/api/projects/route";

const SCREEN_W = 180;
const SCREEN_H = 80;
const MODAL_W = 150;
const MODAL_H = 60;

const ROLE_COLOR: Record<string, { node: string; badge: string }> = {
  user:   { node: "border-[#9fbbe0] bg-[#9fbbe0]/10",   badge: "bg-[#9fbbe0]/20 text-[#26251e]" },
  shared: { node: "border-[#c0a8dd] bg-[#c0a8dd]/10",  badge: "bg-[#c0a8dd]/20 text-[#26251e]" },
  admin:  { node: "border-[#dfa88f] bg-[#dfa88f]/10",   badge: "bg-[#dfa88f]/20 text-[#26251e]" },
  seller: { node: "border-[#9fc9a2] bg-[#9fc9a2]/10",  badge: "bg-[#9fc9a2]/20 text-[#26251e]" },
  modal:  { node: "border-[#e6e5e0] bg-white",          badge: "bg-[#e6e5e0] text-[#807d72]" },
};

function getColor(node: GraphNode) {
  if (node.type === "modal") return ROLE_COLOR.modal;
  return ROLE_COLOR[node.role] ?? ROLE_COLOR.user;
}

function ConnectionSvg({
  edges, nodes, size,
}: {
  edges: GraphEdge[];
  nodes: GraphNode[];
  size: { width: number; height: number };
}) {
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
          <path d="M0,0 L0,6 L6,3 z" fill="#cfcdc4" />
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
            stroke="#cfcdc4"
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
  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = edges.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to));

  if (loading) return <div className="flex items-center justify-center h-full text-sm text-[#807d72] bg-[#f7f7f4]">그래프 로딩 중...</div>;
  if (error)   return <div className="flex items-center justify-center h-full text-sm text-[#cf2d56] bg-[#f7f7f4]">{error}</div>;
  if (nodes.length === 0) return <div className="flex items-center justify-center h-full text-sm text-[#807d72] bg-[#f7f7f4]">IA_Structure.csv 없음</div>;

  const screenCount = nodes.filter(n => n.type === "screen").length;
  const modalCount  = nodes.filter(n => n.type === "modal").length;

  return (
    <div className="flex flex-col h-full bg-[#f7f7f4]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-[#e6e5e0] bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#a09c92]" />
          <span className="text-[11px] font-semibold text-[#807d72] uppercase tracking-wider">화면 플로우</span>
        </div>

        <div className="flex items-center gap-1 ml-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              style={{ borderRadius: "8px" }}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                filter === r
                  ? "bg-[#26251e] text-white"
                  : "text-[#807d72] hover:bg-[#f7f7f4] hover:text-[#26251e]"
              }`}
            >
              {r === "all" ? "전체" : r}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4 text-[11px] text-[#a09c92]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#9fbbe0]" />화면 {screenCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#e6e5e0]" />모달 {modalCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t border-dashed border-[#cfcdc4]" />파생/인증
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto bg-[#f7f7f4]">
          <div className="relative" style={{ minWidth: contentSize.width, minHeight: contentSize.height }}>
            <ConnectionSvg edges={visibleEdges} nodes={visibleNodes} size={contentSize} />

            {visibleNodes.map((node) => {
              const isModal  = node.type === "modal";
              const w        = isModal ? MODAL_W : SCREEN_W;
              const h        = isModal ? MODAL_H : SCREEN_H;
              const color    = getColor(node);
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
                    className={`w-full border p-2.5 cursor-pointer transition-all bg-white
                      ${color.node}
                      ${isModal ? "opacity-80" : ""}
                    `}
                    style={{
                      height: h,
                      borderRadius: "12px",
                      boxShadow: isSelected
                        ? "0 0 0 2px #26251e, 0 4px 12px rgba(38,37,30,0.08)"
                        : "0 1px 3px rgba(38,37,30,0.04)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-1 h-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          {isModal ? (
                            <span className="text-[9px] uppercase tracking-widest text-[#a09c92] bg-[#f7f7f4] px-1.5 py-0.5 rounded font-semibold">
                              modal
                            </span>
                          ) : (
                            <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded font-semibold ${color.badge}`}>
                              {node.role}
                            </span>
                          )}
                          {node.authRequired && <Lock className="w-2.5 h-2.5 text-[#c08532] shrink-0" />}
                          {!node.authRequired && !isModal && <Unlock className="w-2.5 h-2.5 text-[#e6e5e0] shrink-0" />}
                        </div>
                        <p className="text-[11px] font-semibold leading-tight truncate text-[#26251e]">{node.label}</p>
                        {!isModal && <p className="text-[9px] text-[#a09c92] mt-0.5 font-mono">{node.id}</p>}
                      </div>
                      {isSelected && <ExternalLink className="w-3 h-3 text-[#807d72] shrink-0 mt-0.5" />}
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
            className="w-72 shrink-0 border-l border-[#e6e5e0] bg-white overflow-y-auto"
          >
            <div className="flex items-start justify-between px-5 py-4 border-b border-[#e6e5e0]">
              <div>
                <p className="text-[10px] text-[#a09c92] uppercase tracking-wider">{selected.type} · {selected.role}</p>
                <p className="text-sm font-semibold text-[#26251e] mt-0.5">{selected.label}</p>
                <p className="text-[11px] font-mono text-[#a09c92] mt-0.5">{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#a09c92] hover:text-[#26251e] text-lg leading-none mt-0.5">×</button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex items-center gap-2">
                {selected.authRequired ? (
                  <span className="text-[11px] px-2.5 py-1 rounded-full border border-[#c08532]/30 text-[#c08532] bg-[#c08532]/10 font-semibold uppercase tracking-wider">
                    🔒 로그인 필요
                  </span>
                ) : (
                  <span className="text-[11px] px-2.5 py-1 rounded-full border border-[#e6e5e0] text-[#807d72] uppercase tracking-wider font-semibold">
                    공개
                  </span>
                )}
              </div>
              {selected.description && (
                <p className="text-xs text-[#807d72] leading-relaxed">{selected.description}</p>
              )}
              <div>
                <p className="text-[10px] font-semibold text-[#a09c92] mb-2 uppercase tracking-wider">연결 화면</p>
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
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-[#f7f7f4] transition-colors"
                          style={{ borderRadius: "8px" }}
                        >
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${otherColor.badge}`}>
                            {other.role}
                          </span>
                          <span className="text-xs text-[#5a5852] truncate">{other.label}</span>
                          <span className="ml-auto text-[9px] text-[#a09c92] shrink-0">{e.from === selected.id ? "→" : "←"} {e.label}</span>
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
