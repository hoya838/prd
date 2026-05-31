"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArtifactContent } from "@/components/ArtifactContent";
import type { ProjectInfo } from "@/app/api/projects/route";

type ArtifactKey = keyof ProjectInfo["artifacts"];

const TABS: { key: ArtifactKey; label: string }[] = [
  { key: "PRD",           label: "PRD" },
  { key: "IA",            label: "IA 구조" },
  { key: "Screen_Specs",  label: "화면 명세" },
  { key: "Sprint_Backlog",label: "스프린트" },
  { key: "ERD",           label: "ERD" },
  { key: "Policy",        label: "정책" },
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
      <div
        className="flex items-end justify-between px-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#000", paddingTop: 0 }}
      >
        <TabsList className="gap-0 bg-transparent p-0">
          {TABS.map(({ key, label }) => {
            const status = project.artifacts[key];
            const isActive = activeTab === key;
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-1.5 rounded-none pb-2.5 pt-3 px-4 text-xs font-medium border-b-2 transition-colors"
                style={{
                  borderBottomColor: isActive ? "#fff" : "transparent",
                  color: isActive ? "#fff" : "#555",
                  background: "transparent",
                  letterSpacing: "-0.12px",
                }}
              >
                {label}
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: status.exists ? "#22c55e" : "#222" }}
                />
              </TabsTrigger>
            );
          })}
        </TabsList>
        <button
          onClick={() => downloadArtifact(project.name, activeTab)}
          disabled={!currentExists}
          className="mb-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          style={{
            borderRadius: 100,
            color: "#555",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            cursor: currentExists ? "pointer" : "not-allowed",
            fontSize: 11,
            letterSpacing: "-0.11px",
          }}
          onMouseEnter={e => { if (currentExists) (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#555"; }}
        >
          <Download className="w-3.5 h-3.5" />
          다운로드
        </button>
      </div>
      {TABS.map(({ key }) => {
        const status = project.artifacts[key];
        return (
          <TabsContent key={key} value={key} className="flex-1 m-0 overflow-hidden" style={{ background: "#000" }}>
            {status.exists ? (
              <ScrollArea className="h-full">
                <div className="min-h-full">
                  {status.mtime && (
                    <div className="px-6 pt-5 pb-0" style={{ fontSize: 10, color: "#333", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      마지막 수정: {fmtDate(status.mtime)}
                    </div>
                  )}
                  <ArtifactContent project={project.name} artifactKey={key} />
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full" style={{ fontSize: 14, color: "#333" }}>
                파일 없음
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
