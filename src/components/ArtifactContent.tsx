"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Papa from "papaparse";
import type { ProjectInfo } from "@/app/api/projects/route";

type ArtifactKey = keyof ProjectInfo["artifacts"];

function CsvTable({ content }: { content: string }) {
  const result = Papa.parse<string[]>(content, { skipEmptyLines: true });
  const [header, ...rows] = result.data;
  if (!header) return <p className="text-[#807d72] text-sm p-6">내용 없음</p>;
  return (
    <div className="overflow-x-auto p-6">
      <table className="text-sm w-full border-collapse bg-white rounded-xl overflow-hidden border border-[#e6e5e0]">
        <thead>
          <tr className="bg-[#f7f7f4]">
            {header.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#807d72] uppercase tracking-wider border-b border-[#e6e5e0] whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-[#e6e5e0] last:border-0 hover:bg-[#fafaf7] transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-[#5a5852] align-top font-mono text-xs">
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
        <div className="flex flex-col gap-2 p-6">
          {parsed.map((item, i) => (
            <div key={i} className="border border-[#e6e5e0] rounded-xl px-5 py-4 bg-white text-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[11px] text-[#a09c92]">{item.id ?? i + 1}</span>
                {item.type && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e6e5e0] text-[#5a5852] uppercase tracking-wider font-semibold">
                    {item.type}
                  </span>
                )}
                {item.status && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                    item.status === "done"
                      ? "bg-[#1f8a65]/10 text-[#1f8a65]"
                      : "bg-[#e6e5e0] text-[#5a5852]"
                  }`}>
                    {item.status}
                  </span>
                )}
              </div>
              <p className="font-medium text-[#26251e] text-sm">{item.title ?? item.name ?? JSON.stringify(item)}</p>
              {item.description && <p className="text-[#807d72] mt-1.5 text-xs leading-relaxed">{item.description}</p>}
              {item.acceptance_criteria && (
                <ul className="mt-2.5 list-disc list-inside text-xs text-[#807d72] space-y-1">
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
      <pre className="text-xs text-[#5a5852] bg-white rounded-xl border border-[#e6e5e0] p-5 m-6 overflow-x-auto whitespace-pre-wrap font-mono">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  } catch {
    return <pre className="text-xs text-[#cf2d56] p-6 font-mono">{content}</pre>;
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

  if (loading) return <div className="p-6 text-sm text-[#a09c92]">불러오는 중...</div>;
  if (error) return <div className="p-6 text-sm text-[#cf2d56]">{error}</div>;
  if (!data) return null;

  if (data.ext === "md") {
    return (
      <div className="p-6 mx-auto max-w-3xl">
        <div className="bg-white rounded-xl border border-[#e6e5e0] p-8 prose prose-sm max-w-none
          prose-headings:font-semibold prose-headings:text-[#26251e] prose-headings:tracking-tight
          prose-p:text-[#5a5852] prose-p:leading-relaxed
          prose-li:text-[#5a5852]
          prose-strong:text-[#26251e]
          prose-code:font-mono prose-code:text-[#26251e] prose-code:bg-[#f7f7f4] prose-code:rounded prose-code:px-1
          prose-pre:bg-[#f7f7f4] prose-pre:border prose-pre:border-[#e6e5e0] prose-pre:rounded-xl
          prose-a:text-[#f54e00] prose-a:no-underline hover:prose-a:underline
          prose-hr:border-[#e6e5e0]
          prose-table:text-[#5a5852]
          prose-th:text-[#26251e] prose-th:font-semibold
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  if (data.ext === "csv") return <CsvTable content={data.content} />;
  if (data.ext === "json") return <JsonViewer content={data.content} />;

  return <pre className="p-6 text-xs text-[#5a5852] font-mono">{data.content}</pre>;
}
