"use client";

import { CheckCircle2, Circle, FolderOpen, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import type { ProjectInfo } from "@/app/api/projects/route";
import { ScrollArea } from "@/components/ui/scroll-area";

const ARTIFACTS = ["PRD", "IA", "Screen_Specs", "Sprint_Backlog", "ERD", "Policy"] as const;

function completionCount(project: ProjectInfo): number {
  return ARTIFACTS.filter((k) => project.artifacts[k].exists).length;
}

export function Sidebar({
  projects,
  selected,
  onSelect,
  loading,
}: {
  projects: ProjectInfo[];
  selected: string | null;
  onSelect: (name: string) => void;
  loading: boolean;
}) {
  const { data: session } = useSession();

  return (
    <div className="w-60 shrink-0 flex flex-col" style={{ background: "#000", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Header with logo */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="기획뷰어" style={{ height: 18, width: "auto", display: "block" }} />
        <p style={{ fontSize: 10, color: "#333", marginTop: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>ai_pm_editor</p>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="px-5 py-6" style={{ fontSize: 12, color: "#555" }}>불러오는 중...</div>
        ) : projects.length === 0 ? (
          <div className="px-5 py-6" style={{ fontSize: 12, color: "#555" }}>프로젝트 없음</div>
        ) : (
          <div className="py-2">
            {projects.map((p) => {
              const count = completionCount(p);
              const isSelected = p.name === selected;
              return (
                <button
                  key={p.name}
                  onClick={() => onSelect(p.name)}
                  className="w-full flex items-start gap-2.5 px-4 py-3 text-left transition-colors"
                  style={{
                    background: isSelected ? "#1a1a1a" : "transparent",
                    borderLeft: isSelected ? "2px solid rgba(255,255,255,0.5)" : "2px solid transparent",
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#0d0d0d"; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <FolderOpen
                    className="w-4 h-4 mt-0.5 shrink-0"
                    style={{ color: isSelected ? "#fff" : "#444" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: isSelected ? "#fff" : "#666" }}>{p.name}</p>
                    <p style={{ fontSize: 10, color: "#444", marginTop: 2 }}>
                      {count}/{ARTIFACTS.length} 산출물
                    </p>
                  </div>
                  <div className="ml-auto shrink-0 mt-0.5">
                    {count === ARTIFACTS.length ? (
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
                    ) : (
                      <Circle className="w-3.5 h-3.5" style={{ color: "#222" }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* User + Logout */}
      <div className="px-4 py-3 flex items-center gap-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {session?.user?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt="" className="w-6 h-6 rounded-full shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="truncate" style={{ fontSize: 11, fontWeight: 500, color: "#555" }}>
            {session?.user?.name ?? session?.user?.email ?? ""}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title="로그아웃"
          className="shrink-0 transition-colors"
          style={{ color: "#333", background: "none", border: "none", cursor: "pointer", padding: 4 }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#999")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#333")}
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
