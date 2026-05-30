"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { motion, type PanInfo } from "framer-motion";
import { Lock, Unlock, Layers, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GraphNode, GraphEdge } from "@/app/api/projects/[project]/graph/route";
import type { ProjectInfo } from "@/app/api/projects/route";

const SCREEN_W = 180;
const SCREEN_H = 80;
const MODAL_W = 150;
const MODAL_H = 60;

const ROLE_COLOR: Record<string, { node: string; badge: string }> = {
  user:   { node: "border-blue-400/50 bg-blue-400/10 text-blue-600",     badge: "border-blue-300 text-blue-600" },
  shared: { node: "border-violet-400/50 bg-violet-400/10 text-violet-600", badge: "border-violet-300 text-violet-600" },
  admin:  { node: "border-red-400/50 bg-red-400/10 text-red-600",         badge: "border-red-300 text-red-600" },
  seller: { node: "border-green-400/50 bg-green-400/10 text-green-600",   badge: "border-green-300 text-green-600" },
  modal:  { node: "border-zinc-300 bg-zinc-50 text-zinc-600",             badge: "border-zinc-200 text-zinc-500" },
};

function getColor(node: GraphNode) {
  if (node.type === "modal") return ROLE_COLOR.modal;
  return ROLE_COLOR[node.role] ?? ROLE_COLOR.user;
}

function ConnectionSvg({
  edges,
  nodes,
  size,
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
          <path d="M0,0 L0,6 L6,3 z" fill="currentColor" opacity="0.4" />
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
          // vertical drop for modals
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
            stroke="currentColor"
            strokeWidth={isModal ? 1.5 : 2}
            strokeDasharray={edge.dashed ? "6,4" : "none"}
            strokeLinecap="round"
            opacity={isModal ? 0.25 : 0.35}
            markerEnd="url(#arrow)"
            className="text-foreground"
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

  if (loading) return <div className="flex items-center justify-center h-full text-sm text-zinc-400">그래프 로딩 중...</div>;
  if (error)   return <div className="flex items-center justify-center h-full text-sm text-red-400">{error}</div>;
  if (nodes.length === 0) return <div className="flex items-center justify-center h-full text-sm text-zinc-400">IA_Structure.csv 없음</div>;

  const screenCount = nodes.filter(n => n.type === "screen").length;
  const modalCount  = nodes.filter(n => n.type === "modal").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-600 uppercase tracking-widest">화면 플로우</span>
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-1 ml-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filter === r ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"
              }`}
            >
              {r === "all" ? "전체" : r}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-blue-400" />화면 {screenCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-zinc-300" />모달 {modalCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t border-dashed border-zinc-400" />파생/인증
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto bg-zinc-50/50">
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
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  whileHover={{ scale: 1.03, zIndex: 10 }}
                  whileDrag={{ scale: 1.06, zIndex: 50, cursor: "grabbing" }}
                >
                  <div
                    onClick={() => setSelected(isSelected ? null : node)}
                    className={`w-full rounded-lg border-2 p-2.5 cursor-pointer transition-all bg-white shadow-sm
                      ${color.node}
                      ${isSelected ? "ring-2 ring-offset-1 ring-zinc-700 shadow-md" : "hover:shadow-md"}
                      ${isModal ? "opacity-80" : ""}
                    `}
                    style={{ height: h }}
                  >
                    <div className="flex items-start justify-between gap-1 h-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          {isModal ? (
                            <span className="text-[8px] uppercase tracking-widest text-zinc-400 bg-zinc-100 px-1 rounded">modal</span>
                          ) : (
                            <span className={`text-[8px] uppercase tracking-widest px-1 rounded border ${color.badge}`}>{node.role}</span>
                          )}
                          {node.authRequired && <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
                          {!node.authRequired && !isModal && <Unlock className="w-2.5 h-2.5 text-zinc-300 shrink-0" />}
                        </div>
                        <p className="text-[11px] font-semibold leading-tight truncate text-zinc-800">{node.label}</p>
                        {!isModal && <p className="text-[9px] text-zinc-400 mt-0.5 font-mono">{node.id}</p>}
                      </div>
                      {isSelected && <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />}
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
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-72 shrink-0 border-l bg-white overflow-y-auto"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{selected.type} · {selected.role}</p>
                <p className="text-sm font-semibold text-zinc-900 mt-0.5">{selected.label}</p>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-zinc-700">×</button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                {selected.authRequired ? (
                  <Badge variant="outline" className="border-amber-300 text-amber-700 text-xs">🔒 로그인 필요</Badge>
                ) : (
                  <Badge variant="outline" className="border-zinc-200 text-zinc-500 text-xs">공개</Badge>
                )}
              </div>
              {selected.description && (
                <p className="text-xs text-zinc-500 leading-relaxed">{selected.description}</p>
              )}
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">연결 화면</p>
                <div className="space-y-1">
                  {edges
                    .filter(e => e.from === selected.id || e.to === selected.id)
                    .map((e, i) => {
                      const other = nodes.find(n => n.id === (e.from === selected.id ? e.to : e.from));
                      if (!other) return null;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelected(other)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left hover:bg-zinc-50 transition-colors"
                        >
                          <span className={`text-[9px] px-1 rounded border ${getColor(other).badge}`}>{other.role}</span>
                          <span className="text-xs text-zinc-700 truncate">{other.label}</span>
                          <span className="ml-auto text-[9px] text-zinc-400">{e.from === selected.id ? "→" : "←"} {e.label}</span>
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
