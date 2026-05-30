"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Papa from "papaparse";
import { Badge } from "@/components/ui/badge";
import type { ProjectInfo } from "@/app/api/projects/route";

type ArtifactKey = keyof ProjectInfo["artifacts"];

function CsvTable({ content }: { content: string }) {
  const result = Papa.parse<string[]>(content, { skipEmptyLines: true });
  const [header, ...rows] = result.data;
  if (!header) return <p className="text-zinc-400 text-sm p-4">내용 없음</p>;
  return (
    <div className="overflow-x-auto p-4">
      <table className="text-sm w-full border-collapse">
        <thead>
          <tr className="bg-zinc-100">
            {header.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-medium text-zinc-700 border border-zinc-200 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="even:bg-zinc-50">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-1.5 border border-zinc-200 text-zinc-700 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JsonViewer({ content }: { content: string }) {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return (
        <div className="flex flex-col gap-2 p-4">
          {parsed.map((item, i) => (
            <div key={i} className="border rounded-lg px-4 py-3 bg-white text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-zinc-400">{item.id ?? i + 1}</span>
                {item.type && <Badge variant="outline" className="text-xs">{item.type}</Badge>}
                {item.status && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${item.status === "done" ? "border-emerald-300 text-emerald-700" : ""}`}
                  >
                    {item.status}
                  </Badge>
                )}
              </div>
              <p className="font-medium text-zinc-900">{item.title ?? item.name ?? JSON.stringify(item)}</p>
              {item.description && <p className="text-zinc-500 mt-1 text-xs">{item.description}</p>}
              {item.acceptance_criteria && (
                <ul className="mt-2 list-disc list-inside text-xs text-zinc-500 space-y-0.5">
                  {item.acceptance_criteria.map((ac: string, j: number) => (
                    <li key={j}>{ac}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    }
    return (
      <pre className="text-xs text-zinc-700 bg-zinc-50 rounded p-4 m-4 overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  } catch {
    return <pre className="text-xs text-red-500 p-4">{content}</pre>;
  }
}

export function ArtifactContent({ project, artifactKey }: { project: string; artifactKey: ArtifactKey }) {
  const [data, setData] = useState<{ content: string; ext: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData(null);
    setError(null);
    fetch(`/api/projects/${encodeURIComponent(project)}/${artifactKey}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("요청 실패"))
      .finally(() => setLoading(false));
  }, [project, artifactKey]);

  if (loading) return <div className="p-6 text-sm text-zinc-400">불러오는 중...</div>;
  if (error) return <div className="p-6 text-sm text-red-400">{error}</div>;
  if (!data) return null;

  if (data.ext === "md") {
    return (
      <div className="p-6 prose prose-sm prose-zinc max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content}</ReactMarkdown>
      </div>
    );
  }

  if (data.ext === "csv") return <CsvTable content={data.content} />;
  if (data.ext === "json") return <JsonViewer content={data.content} />;

  return <pre className="p-6 text-xs text-zinc-700">{data.content}</pre>;
}
