"use client";

import { CheckCircle2, Circle, FolderOpen } from "lucide-react";
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
  return (
    <div className="w-60 shrink-0 border-r border-[#e6e5e0] bg-[#f7f7f4] flex flex-col">
      <div className="px-5 py-5 border-b border-[#e6e5e0]">
        <h2 className="text-sm font-semibold text-[#26251e] tracking-tight">기획뷰어</h2>
        <p className="text-[11px] text-[#807d72] mt-0.5 tracking-wide uppercase">ai_pm_editor</p>
      </div>
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="px-5 py-6 text-xs text-[#807d72]">불러오는 중...</div>
        ) : projects.length === 0 ? (
          <div className="px-5 py-6 text-xs text-[#807d72]">프로젝트 없음</div>
        ) : (
          <div className="py-2">
            {projects.map((p) => {
              const count = completionCount(p);
              const isSelected = p.name === selected;
              return (
                <button
                  key={p.name}
                  onClick={() => onSelect(p.name)}
                  className={`w-full flex items-start gap-2.5 px-5 py-3 text-left transition-colors ${
                    isSelected
                      ? "bg-white text-[#26251e]"
                      : "text-[#5a5852] hover:bg-[#fafaf7]"
                  }`}
                >
                  <FolderOpen
                    className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-[#f54e00]" : "text-[#a09c92]"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate text-[#26251e]">{p.name}</p>
                    <p className="text-[11px] text-[#807d72] mt-0.5">
                      {count}/{ARTIFACTS.length} 산출물
                    </p>
                  </div>
                  <div className="ml-auto shrink-0 mt-0.5">
                    {count === ARTIFACTS.length ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1f8a65]" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-[#e6e5e0]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
