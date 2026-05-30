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
    <div className="w-60 shrink-0 border-r bg-white flex flex-col">
      <div className="px-4 py-4 border-b">
        <h2 className="text-sm font-semibold text-zinc-900">기획뷰어</h2>
        <p className="text-xs text-zinc-400 mt-0.5">ai_pm_editor 산출물</p>
      </div>
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="px-4 py-6 text-xs text-zinc-400">불러오는 중...</div>
        ) : projects.length === 0 ? (
          <div className="px-4 py-6 text-xs text-zinc-400">프로젝트 없음</div>
        ) : (
          <div className="py-2">
            {projects.map((p) => {
              const count = completionCount(p);
              const isSelected = p.name === selected;
              return (
                <button
                  key={p.name}
                  onClick={() => onSelect(p.name)}
                  className={`w-full flex items-start gap-2 px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <FolderOpen
                    className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-zinc-900" : "text-zinc-400"}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {count}/{ARTIFACTS.length} 산출물
                    </p>
                  </div>
                  <div className="ml-auto shrink-0">
                    {count === ARTIFACTS.length ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-zinc-200" />
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
