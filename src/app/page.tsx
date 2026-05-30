"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ArtifactViewer } from "@/components/ArtifactViewer";
import { WorkflowView } from "@/components/WorkflowView";
import { ScreenFlowView } from "@/components/ScreenFlowView";
import type { ProjectInfo } from "@/app/api/projects/route";

type View = "artifacts" | "workflow" | "screenflow";

const VIEWS: { key: View; label: string }[] = [
  { key: "artifacts",  label: "산출물" },
  { key: "workflow",   label: "산출물 플로우" },
  { key: "screenflow", label: "화면 플로우" },
];

export default function Home() {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<View>("artifacts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => {
        setProjects(d.projects ?? []);
        if (d.projects?.length > 0) setSelected(d.projects[0].name);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedProject = projects.find((p) => p.name === selected) ?? null;

  return (
    <div className="flex h-screen bg-zinc-50 font-sans">
      <Sidebar
        projects={projects}
        selected={selected}
        onSelect={(name) => { setSelected(name); }}
        loading={loading}
      />
      <div className="flex flex-col flex-1 min-w-0">
        {selectedProject ? (
          <>
            <div className="flex items-center gap-2 px-5 py-2.5 border-b bg-white shrink-0">
              <h1 className="text-base font-semibold text-zinc-800">{selectedProject.name}</h1>
              <div className="ml-auto flex gap-1">
                {VIEWS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setView(key)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      view === key
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-500 hover:bg-zinc-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {view === "artifacts"  && <ArtifactViewer project={selectedProject} />}
              {view === "workflow"   && <WorkflowView   project={selectedProject} />}
              {view === "screenflow" && <ScreenFlowView project={selectedProject} />}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-zinc-400 text-sm">
            {loading ? "불러오는 중..." : "프로젝트를 선택하세요"}
          </div>
        )}
      </div>
    </div>
  );
}
