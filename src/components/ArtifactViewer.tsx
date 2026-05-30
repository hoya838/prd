"use client";

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

export function ArtifactViewer({ project }: { project: ProjectInfo }) {
  return (
    <Tabs defaultValue="PRD" className="flex flex-col h-full">
      <div className="border-b bg-white px-4 pt-2">
        <TabsList className="gap-1 bg-transparent p-0">
          {TABS.map(({ key, label }) => {
            const status = project.artifacts[key];
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-1.5 data-[state=active]:border-b-2 data-[state=active]:border-zinc-900 rounded-none pb-2 px-3 text-sm"
              >
                {label}
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    status.exists ? "bg-emerald-500" : "bg-zinc-200"
                  }`}
                />
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
      {TABS.map(({ key }) => {
        const status = project.artifacts[key];
        return (
          <TabsContent key={key} value={key} className="flex-1 m-0 overflow-hidden">
            {status.exists ? (
              <ScrollArea className="h-full">
                <div className="min-h-full">
                  {status.mtime && (
                    <div className="px-6 pt-4 pb-0 text-xs text-zinc-400">
                      마지막 수정: {fmtDate(status.mtime)}
                    </div>
                  )}
                  <ArtifactContent project={project.name} artifactKey={key} />
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                파일 없음
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
