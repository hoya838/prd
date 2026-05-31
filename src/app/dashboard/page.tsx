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
    <div className="flex h-screen" style={{ background: "#000" }}>
      <Sidebar
        projects={projects}
        selected={selected}
        onSelect={(name) => { setSelected(name); }}
        loading={loading}
      />
      <div className="flex flex-col flex-1 min-w-0">
        {selectedProject ? (
          <>
            {/* Topbar */}
            <div
              className="flex items-center gap-3 px-6 py-3 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#000" }}
            >
              <h1 style={{ fontSize: 13, fontWeight: 600, color: "#fff", letterSpacing: "-0.3px" }}>
                {selectedProject.name}
              </h1>
              <div className="ml-auto flex gap-1">
                {VIEWS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setView(key)}
                    style={{
                      borderRadius: 100,
                      padding: "5px 14px",
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: "-0.12px",
                      background: view === key ? "#fff" : "transparent",
                      color: view === key ? "#000" : "#555",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (view !== key) (e.currentTarget as HTMLElement).style.color = "#999"; }}
                    onMouseLeave={e => { if (view !== key) (e.currentTarget as HTMLElement).style.color = "#555"; }}
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
          <div className="flex flex-1 items-center justify-center" style={{ fontSize: 14, color: "#444" }}>
            {loading ? "불러오는 중..." : "프로젝트를 선택하세요"}
          </div>
        )}
      </div>
    </div>
  );
}
