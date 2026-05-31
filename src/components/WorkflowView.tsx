"use client";

import { motion, type PanInfo, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Table2, Monitor, Kanban, Database, Shield, ArrowRight, X } from "lucide-react";
import { ArtifactContent } from "@/components/ArtifactContent";
import type { ProjectInfo } from "@/app/api/projects/route";

type ArtifactKey = keyof ProjectInfo["artifacts"];

interface WorkflowNode {
  id: ArtifactKey;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  dot: string;
  type: string;
  position: { x: number; y: number };
}

interface Connection {
  from: ArtifactKey;
  to: ArtifactKey;
}

const NODE_WIDTH  = 210;
const NODE_HEIGHT = 110;

// AI timeline pastels (work well on dark)
const NODE_DOT: Record<string, string> = {
  blue:   "#9fbbe0",
  violet: "#c0a8dd",
  orange: "#dfa88f",
  green:  "#9fc9a2",
  gold:   "#c08532",
  muted:  "rgba(255,255,255,0.2)",
};

const INITIAL_NODES: WorkflowNode[] = [
  { id: "PRD",            label: "PRD",      desc: "제품 요구사항 문서",        icon: FileText, dot: "blue",   type: "source",    position: { x: 50,  y: 80  } },
  { id: "IA",             label: "IA 구조",  desc: "정보 아키텍처 & 화면 목록", icon: Table2,   dot: "violet", type: "transform", position: { x: 310, y: 80  } },
  { id: "Screen_Specs",   label: "화면 명세", desc: "UX 명세·모달·UX라이팅",    icon: Monitor,  dot: "orange", type: "transform", position: { x: 570, y: 80  } },
  { id: "Sprint_Backlog", label: "스프린트",  desc: "백로그 티켓·우선순위",      icon: Kanban,   dot: "green",  type: "transform", position: { x: 830, y: 80  } },
  { id: "ERD",            label: "ERD",      desc: "데이터 모델·엔티티 관계",    icon: Database, dot: "gold",   type: "transform", position: { x: 570, y: 260 } },
  { id: "Policy",         label: "정책",     desc: "운영 정책·법적 동의",        icon: Shield,   dot: "muted",  type: "output",    position: { x: 50,  y: 260 } },
];

const INITIAL_CONNECTIONS: Connection[] = [
  { from: "PRD",          to: "IA"             },
  { from: "IA",           to: "Screen_Specs"   },
  { from: "Screen_Specs", to: "Sprint_Backlog" },
  { from: "PRD",          to: "ERD"            },
  { from: "PRD",          to: "Policy"         },
];

function ConnectionLine({ from, to, nodes }: { from: string; to: string; nodes: WorkflowNode[] }) {
  const fromNode = nodes.find((n) => n.id === from);
  const toNode   = nodes.find((n) => n.id === to);
  if (!fromNode || !toNode) return null;

  const startX = fromNode.position.x + NODE_WIDTH;
  const startY = fromNode.position.y + NODE_HEIGHT / 2;
  const endX   = toNode.position.x;
  const endY   = toNode.position.y + NODE_HEIGHT / 2;

  const goLeft = endX < startX;
  let path: string;
  if (goLeft) {
    const midX = (fromNode.position.x + toNode.position.x + NODE_WIDTH) / 2;
    path = `M${startX},${startY} C${midX},${startY} ${midX},${endY} ${endX},${endY}`;
  } else {
    const cp1X = startX + (endX - startX) * 0.5;
    const cp2X = endX   - (endX - startX) * 0.5;
    path = `M${startX},${startY} C${cp1X},${startY} ${cp2X},${endY} ${endX},${endY}`;
  }

  return (
    <path
      d={path}
      fill="none"
      stroke="rgba(255,255,255,0.12)"
      strokeWidth={1.5}
      strokeDasharray="6,5"
      strokeLinecap="round"
    />
  );
}

export function WorkflowView({ project }: { project: ProjectInfo }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_NODES);
  const [activeKey, setActiveKey] = useState<ArtifactKey | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStart  = useRef<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [contentSize, setContentSize] = useState(() => ({
    width:  Math.max(...INITIAL_NODES.map((n) => n.position.x + NODE_WIDTH))  + 60,
    height: Math.max(...INITIAL_NODES.map((n) => n.position.y + NODE_HEIGHT)) + 60,
  }));

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
      width:  Math.max(prev.width,  x + NODE_WIDTH  + 60),
      height: Math.max(prev.height, y + NODE_HEIGHT + 60),
    }));
  };

  const handleDragEnd = () => {
    setDragging(null);
    dragStart.current = null;
  };

  const existsCount = INITIAL_NODES.filter((n) => project.artifacts[n.id].exists).length;
  const activeNode  = nodes.find((n) => n.id === activeKey);

  return (
    <div className="flex h-full" style={{ background: "#000" }}>
      <div className="flex-1 flex flex-col p-5 overflow-hidden">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 10, fontWeight: 600, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase" }}>산출물 플로우</span>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "3px 10px", borderRadius: 100,
              background: "rgba(34,197,94,0.1)", color: "#22c55e",
            }}>
              {existsCount}/{INITIAL_NODES.length} 완료
            </span>
          </div>
          <p style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#333" }}>
            노드 클릭 → 상세 | 드래그 → 이동
          </p>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-auto"
          style={{
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "#0a0a0a",
          }}
        >
          <div className="relative" style={{ minWidth: contentSize.width, minHeight: contentSize.height }}>
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              width={contentSize.width}
              height={contentSize.height}
              style={{ overflow: "visible" }}
              aria-hidden="true"
            >
              {INITIAL_CONNECTIONS.map((c) => (
                <ConnectionLine key={`${c.from}-${c.to}`} from={c.from} to={c.to} nodes={nodes} />
              ))}
            </svg>

            {nodes.map((node) => {
              const Icon      = node.icon;
              const isDragging = dragging === node.id;
              const isActive   = activeKey === node.id;
              const exists     = project.artifacts[node.id].exists;
              const dotColor   = NODE_DOT[node.dot];

              return (
                <motion.div
                  key={node.id}
                  drag
                  dragMomentum={false}
                  dragConstraints={{ left: 0, top: 0, right: 100000, bottom: 100000 }}
                  onDragStart={() => handleDragStart(node.id)}
                  onDrag={(_, info) => handleDrag(node.id, info)}
                  onDragEnd={handleDragEnd}
                  style={{ x: node.position.x, y: node.position.y, width: NODE_WIDTH, transformOrigin: "0 0" }}
                  className="absolute cursor-grab"
                  initial={{ scale: 0.88, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.18 }}
                  whileHover={{ scale: 1.03, zIndex: 10 }}
                  whileDrag={{ scale: 1.05, zIndex: 50, cursor: "grabbing" }}
                >
                  <div
                    onClick={() => !isDragging && setActiveKey(isActive ? null : node.id)}
                    className="relative w-full p-4 cursor-pointer transition-all"
                    style={{
                      height: NODE_HEIGHT,
                      borderRadius: 12,
                      background: isActive ? "#1a1a1a" : "#111",
                      border: isActive
                        ? "1px solid rgba(255,255,255,0.3)"
                        : "1px solid rgba(255,255,255,0.08)",
                      opacity: exists ? 1 : 0.3,
                      boxShadow: isActive
                        ? "0 0 0 1px rgba(255,255,255,0.2), 0 8px 24px rgba(0,0,0,0.4)"
                        : isDragging
                          ? "0 8px 32px rgba(0,0,0,0.6)"
                          : "none",
                    }}
                  >
                    {/* exists dot */}
                    <span
                      className="absolute -top-1.5 -right-1.5 block w-3 h-3 rounded-full border-2"
                      style={{
                        background: exists ? "#22c55e" : "#222",
                        borderColor: "#0a0a0a",
                      }}
                    />

                    <div className="space-y-2 h-full flex flex-col justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: dotColor + "18", border: `1px solid ${dotColor}35` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: dotColor }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "#444", fontWeight: 600, display: "block" }}>{node.type}</span>
                          <h3 style={{ fontSize: 12, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.label}</h3>
                        </div>
                      </div>
                      <p style={{ fontSize: 10, lineHeight: 1.5, color: "#555", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{node.desc}</p>
                      <div className="flex items-center gap-1.5" style={{ fontSize: 10, color: "#333" }}>
                        <ArrowRight className="h-2.5 w-2.5" />
                        <span style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>{exists ? "파일 있음" : "파일 없음"}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between px-4 py-2 rounded-lg" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "#0a0a0a" }}>
          <div className="flex items-center gap-4" style={{ fontSize: 10, color: "#333" }}>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              <span style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>{existsCount} 파일 존재</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#222" }} />
              <span style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>{INITIAL_CONNECTIONS.length} 연결</span>
            </div>
          </div>
          <p style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#333" }}>{project.name}</p>
        </div>
      </div>

      {/* Slide Panel */}
      <AnimatePresence>
        {activeKey && activeNode && (
          <motion.div
            key={activeKey}
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="w-[420px] shrink-0 flex flex-col"
            style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", background: "#0a0a0a" }}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{
                    background: NODE_DOT[activeNode.dot] + "18",
                    border: `1px solid ${NODE_DOT[activeNode.dot]}35`,
                  }}
                >
                  <activeNode.icon className="h-3.5 w-3.5" style={{ color: NODE_DOT[activeNode.dot] }} />
                </div>
                <div>
                  <p style={{ fontSize: 10, color: "#444", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>{activeNode.type}</p>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>{activeNode.label}</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveKey(null)}
                className="transition-colors"
                style={{ color: "#444", background: "none", border: "none", cursor: "pointer", padding: 4 }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#444")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ScrollArea className="flex-1">
              {project.artifacts[activeKey].exists ? (
                <ArtifactContent project={project.name} artifactKey={activeKey} />
              ) : (
                <div className="flex items-center justify-center h-32" style={{ fontSize: 14, color: "#333" }}>
                  파일 없음
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
