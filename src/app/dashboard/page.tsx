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
    <div className="flex h-screen bg-[#f7f7f4]">
      <Sidebar
        projects={projects}
        selected={selected}
        onSelect={(name) => { setSelected(name); }}
        loading={loading}
      />
      <div className="flex flex-col flex-1 min-w-0">
        {selectedProject ? (
          <>
            <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e6e5e0] bg-white shrink-0">
              <h1 className="text-sm font-semibold text-[#26251e] tracking-tight">{selectedProject.name}</h1>
              <div className="ml-auto flex gap-0.5">
                {VIEWS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setView(key)}
                    style={{ borderRadius: "8px" }}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      view === key
                        ? "bg-[#26251e] text-white"
                        : "text-[#807d72] hover:bg-[#f7f7f4] hover:text-[#26251e]"
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
          <div className="flex flex-1 items-center justify-center text-[#807d72] text-sm">
            {loading ? "불러오는 중..." : "프로젝트를 선택하세요"}
          </div>
        )}
      </div>
    </div>
  );
}
