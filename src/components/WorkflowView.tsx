"use client";

import { motion, type PanInfo, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Table2, Monitor, Kanban, Database, Shield, ArrowRight, X } from "lucide-react";
import { ArtifactContent } from "@/components/ArtifactContent";
import type { ProjectInfo } from "@/app/api/projects/route";

type ArtifactKey = keyof ProjectInfo["artifacts"];

interface WorkflowNode {
  id: ArtifactKey;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  type: string;
  position: { x: number; y: number };
}

interface Connection {
  from: ArtifactKey;
  to: ArtifactKey;
}

const NODE_WIDTH = 210;
const NODE_HEIGHT = 110;

const colorClasses: Record<string, string> = {
  blue:   "border-blue-400/40 bg-blue-400/10 text-blue-400",
  violet: "border-violet-400/40 bg-violet-400/10 text-violet-400",
  orange: "border-orange-400/40 bg-orange-400/10 text-orange-400",
  green:  "border-green-400/40 bg-green-400/10 text-green-400",
  red:    "border-red-400/40 bg-red-400/10 text-red-400",
  zinc:   "border-zinc-400/40 bg-zinc-400/10 text-zinc-400",
};

const INITIAL_NODES: WorkflowNode[] = [
  { id: "PRD",           label: "PRD",      desc: "제품 요구사항 문서",       icon: FileText, color: "blue",   type: "source",    position: { x: 50,  y: 80  } },
  { id: "IA",            label: "IA 구조",  desc: "정보 아키텍처 & 화면 목록", icon: Table2,   color: "violet", type: "transform", position: { x: 310, y: 80  } },
  { id: "Screen_Specs",  label: "화면 명세", desc: "UX 명세·모달·UX라이팅",   icon: Monitor,  color: "orange", type: "transform", position: { x: 570, y: 80  } },
  { id: "Sprint_Backlog",label: "스프린트",  desc: "백로그 티켓·우선순위",     icon: Kanban,   color: "green",  type: "transform", position: { x: 830, y: 80  } },
  { id: "ERD",           label: "ERD",      desc: "데이터 모델·엔티티 관계",   icon: Database, color: "red",    type: "transform", position: { x: 570, y: 260 } },
  { id: "Policy",        label: "정책",     desc: "운영 정책·법적 동의",       icon: Shield,   color: "zinc",   type: "output",    position: { x: 50,  y: 260 } },
];

const INITIAL_CONNECTIONS: Connection[] = [
  { from: "PRD",          to: "IA"            },
  { from: "IA",           to: "Screen_Specs"  },
  { from: "Screen_Specs", to: "Sprint_Backlog"},
  { from: "PRD",          to: "ERD"           },
  { from: "PRD",          to: "Policy"        },
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
      stroke="currentColor"
      strokeWidth={2}
      strokeDasharray="8,6"
      strokeLinecap="round"
      opacity={0.3}
      className="text-foreground"
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
    <div className="flex h-full">
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="rounded-full border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400"
            >
              {existsCount}/{INITIAL_NODES.length} 완료
            </Badge>
            <span className="text-xs uppercase tracking-[0.25em] text-foreground/50">
              워크플로우
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">
            노드 클릭 → 상세 | 드래그 → 이동
          </p>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-auto rounded-xl border border-border/30 bg-background/40"
          role="region"
          aria-label="워크플로우 캔버스"
        >
          <div
            className="relative"
            style={{ minWidth: contentSize.width, minHeight: contentSize.height }}
          >
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
              const Icon = node.icon;
              const isDragging = dragging === node.id;
              const isActive   = activeKey === node.id;
              const exists     = project.artifacts[node.id].exists;

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
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.03 }}
                  whileDrag={{ scale: 1.05, zIndex: 50, cursor: "grabbing" }}
                >
                  <Card
                    onClick={() => !isDragging && setActiveKey(isActive ? null : node.id)}
                    className={`group/node relative w-full overflow-hidden rounded-xl border p-3 backdrop-blur transition-all cursor-pointer
                      ${colorClasses[node.color]}
                      ${!exists ? "opacity-40" : "hover:shadow-lg"}
                      ${isActive ? "ring-2 ring-offset-2 ring-zinc-700 shadow-lg" : ""}
                      ${isDragging ? "shadow-xl ring-2 ring-primary/50" : ""}
                      bg-background/70
                    `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent opacity-0 transition-opacity group-hover/node:opacity-100" />

                    {/* exists dot */}
                    <div className="absolute -top-1.5 -right-1.5">
                      <span className={`block w-3 h-3 rounded-full border-2 border-white ${exists ? "bg-emerald-400" : "bg-zinc-300"}`} />
                    </div>

                    <div className="relative space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${colorClasses[node.color]} bg-background/80`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Badge
                            variant="outline"
                            className="mb-0.5 rounded-full border-border/40 bg-background/80 px-1.5 py-0 text-[9px] uppercase tracking-[0.15em] text-foreground/60"
                          >
                            {node.type}
                          </Badge>
                          <h3 className="truncate text-xs font-semibold tracking-tight text-foreground">
                            {node.label}
                          </h3>
                        </div>
                      </div>
                      <p className="line-clamp-2 text-[10px] leading-relaxed text-foreground/70">
                        {node.desc}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-foreground/50">
                        <ArrowRight className="h-2.5 w-2.5" />
                        <span className="uppercase tracking-[0.1em]">
                          {exists ? "파일 있음" : "파일 없음"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between rounded-lg border border-border/30 bg-background/40 px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-4 text-xs text-foreground/60">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="uppercase tracking-[0.15em]">{existsCount} 파일 존재</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              <span className="uppercase tracking-[0.15em]">{INITIAL_CONNECTIONS.length} 연결</span>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">{project.name}</p>
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
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[420px] shrink-0 border-l bg-white flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${colorClasses[activeNode.color]} bg-background/80`}>
                  <activeNode.icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-widest">{activeNode.type}</p>
                  <h3 className="text-sm font-semibold">{activeNode.label}</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveKey(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ScrollArea className="flex-1">
              {project.artifacts[activeKey].exists ? (
                <ArtifactContent project={project.name} artifactKey={activeKey} />
              ) : (
                <div className="flex items-center justify-center h-32 text-zinc-400 text-sm">
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
