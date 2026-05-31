"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArtifactContent } from "@/components/ArtifactContent";
import type { ProjectInfo } from "@/app/api/projects/route";

type ArtifactKey = keyof ProjectInfo["artifacts"];

const TABS: { key: ArtifactKey; label: string }[] = [
  { key: "PRD", label: "PRD" },
  { key: "IA", label: "IA 구조" },
  { key: "Screen_Specs", label: "화면 명세" },
  { key: "Sprint_Backlog", label: "스프린트" },
  { key: "ERD", label: "ERD" },
  { key: "Policy", label: "정책" },
];

function fmtDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function downloadArtifact(projectName: string, artifactKey: ArtifactKey) {
  const res = await fetch(`/api/projects/${encodeURIComponent(projectName)}/${artifactKey}`);
  if (!res.ok) return;
  const { content, file } = await res.json();
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file;
  a.click();
  URL.revokeObjectURL(url);
}

export function ArtifactViewer({ project }: { project: ProjectInfo }) {
  const [activeTab, setActiveTab] = useState<ArtifactKey>("PRD");
  const currentExists = project.artifacts[activeTab].exists;

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ArtifactKey)} className="flex flex-col h-full">
      <div className="border-b border-[#e6e5e0] bg-white px-5 pt-0 flex items-end justify-between">
        <TabsList className="gap-0 bg-transparent p-0">
          {TABS.map(({ key, label }) => {
            const status = project.artifacts[key];
            const isActive = activeTab === key;
            return (
              <TabsTrigger
                key={key}
                value={key}
                className={`flex items-center gap-1.5 rounded-none pb-2.5 pt-3 px-4 text-xs font-medium border-b-2 transition-colors
                  ${isActive
                    ? "border-[#26251e] text-[#26251e]"
                    : "border-transparent text-[#807d72] hover:text-[#26251e]"
                  }`}
              >
                {label}
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    status.exists ? "bg-[#1f8a65]" : "bg-[#e6e5e0]"
                  }`}
                />
              </TabsTrigger>
            );
          })}
        </TabsList>
        <button
          onClick={() => downloadArtifact(project.name, activeTab)}
          disabled={!currentExists}
          style={{ borderRadius: "8px" }}
          className="mb-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#807d72] hover:bg-[#f7f7f4] hover:text-[#26251e] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          다운로드
        </button>
      </div>
      {TABS.map(({ key }) => {
        const status = project.artifacts[key];
        return (
          <TabsContent key={key} value={key} className="flex-1 m-0 overflow-hidden bg-[#f7f7f4]">
            {status.exists ? (
              <ScrollArea className="h-full">
                <div className="min-h-full">
                  {status.mtime && (
                    <div className="px-6 pt-5 pb-0 text-[11px] text-[#a09c92] uppercase tracking-wider">
                      마지막 수정: {fmtDate(status.mtime)}
                    </div>
                  )}
                  <ArtifactContent project={project.name} artifactKey={key} />
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full text-[#a09c92] text-sm">
                파일 없음
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
