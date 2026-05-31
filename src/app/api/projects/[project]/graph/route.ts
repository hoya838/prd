import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export type GraphNode = {
  id: string;
  label: string;
  type: "screen" | "modal";
  role: string;
  authRequired: boolean;
  parentId: string | null;
  description?: string;
  position: { x: number; y: number };
  exists: boolean;
};

export type GraphEdge = {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

type CsvRow = Record<string, string>;

function readFile(fp: string): string | null {
  try { return fs.readFileSync(fp, "utf-8"); } catch { return null; }
}

function parseModalsFromSpecs(content: string, screenId: string): { id: string; name: string }[] {
  const modals: { id: string; name: string }[] = [];

  // Match screen section by ID
  const sectionRe = new RegExp(
    `###?\\s*(?:${screenId}[^\\n]*)\\n([\\s\\S]*?)(?=\\n###?\\s*SCR-|$)`,
    "i"
  );
  const sectionMatch = content.match(sectionRe);
  const searchIn = sectionMatch ? sectionMatch[0] : content;

  // Find 파생 모달 section
  const modalRe = /파생\s*모달[\s\S]*?(?=\n##|$)/i;
  const modalSection = searchIn.match(modalRe);
  if (!modalSection) return modals;

  const lines = modalSection[0].split("\n");
  for (const line of lines) {
    const m = line.match(/^[-*]\s+\*?\*?([^*:\n]+)/);
    if (!m) continue;
    const name = m[1].trim();
    if (!name || /없음|해당|없다/i.test(name)) continue;
    modals.push({ id: `${screenId}_modal_${modals.length + 1}`, name });
  }
  return modals;
}

// Tree layout: BFS by parent, assign x by depth column, y by sibling order
function computePositions(
  screenRows: { id: string; parentId: string | null }[]
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const children = new Map<string | null, string[]>();

  for (const row of screenRows) {
    const p = row.parentId || null;
    if (!children.has(p)) children.set(p, []);
    children.get(p)!.push(row.id);
  }

  const X_STEP = 260;
  const Y_STEP = 140;

  // BFS
  const queue: { id: string; depth: number; siblingIdx: number; parentY: number }[] = [];
  const roots = children.get(null) ?? [];
  roots.forEach((id, i) => queue.push({ id, depth: 0, siblingIdx: i, parentY: 0 }));

  // Track y per depth column
  const depthYCounter: Record<number, number> = {};

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    const y = (depthYCounter[depth] ?? 0);
    depthYCounter[depth] = y + 1;

    positions.set(id, { x: depth * X_STEP + 40, y: y * Y_STEP + 60 });

    const kids = children.get(id) ?? [];
    kids.forEach((kid, i) => {
      queue.push({ id: kid, depth: depth + 1, siblingIdx: i, parentY: y });
    });
  }

  return positions;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ project: string }> }
) {
  const { project } = await params;
  const base = process.env.OUTPUT_BASE_PATH ?? path.join(process.cwd(), "data");
  if (!base) return NextResponse.json({ error: "OUTPUT_BASE_PATH not set" }, { status: 500 });

  const dir = path.join(base, project);
  const iaContent = readFile(path.join(dir, "IA_Structure.csv"));
  if (!iaContent) return NextResponse.json({ error: "IA_Structure.csv not found" }, { status: 404 });

  const parsed = Papa.parse<CsvRow>(iaContent, { header: true, skipEmptyLines: true });
  const rows = parsed.data;

  // Build raw screen list
  type ScreenRaw = {
    id: string;
    label: string;
    role: string;
    authRequired: boolean;
    parentId: string | null;
    description: string;
  };

  const screens: ScreenRaw[] = [];
  for (const row of rows) {
    const id = (row["screen_id"] || row["id"] || "").trim();
    if (!id) continue;
    const parentRaw = (row["parent_id"] || row["parent_screen_id"] || row["parent"] || "").trim();
    screens.push({
      id,
      label: (row["screen_name"] || row["name"] || id).trim(),
      role: (row["role"] || "user").trim().toLowerCase(),
      authRequired: (row["auth_required"] || "false").toLowerCase() === "true",
      parentId: parentRaw || null,
      description: (row["description"] || row["depth2"] || "").trim(),
    });
  }

  // Compute tree positions
  const positions = computePositions(screens.map((s) => ({ id: s.id, parentId: s.parentId })));

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const screen of screens) {
    const pos = positions.get(screen.id) ?? { x: 40, y: 40 };
    nodes.push({
      id: screen.id,
      label: screen.label,
      type: "screen",
      role: screen.role,
      authRequired: screen.authRequired,
      parentId: screen.parentId,
      description: screen.description,
      position: pos,
      exists: true,
    });

    if (screen.parentId) {
      edges.push({ from: screen.parentId, to: screen.id, label: "nav", dashed: false });
    }

    // Extract modals from Screen_Specs
    const specFiles = [
      `Screen_Specs_${screen.role}.md`,
      "Screen_Specs_shared.md",
      "Screen_Specs_user.md",
      "Screen_Specs.md",
    ];

    for (const sf of specFiles) {
      const content = readFile(path.join(dir, sf));
      if (!content) continue;

      // Only parse the file matching this screen's role
      const modals = parseModalsFromSpecs(content, screen.id);
      if (modals.length > 0) {
        for (let i = 0; i < modals.length; i++) {
          const modal = modals[i];
          nodes.push({
            id: modal.id,
            label: modal.name,
            type: "modal",
            role: screen.role,
            authRequired: screen.authRequired,
            parentId: screen.id,
            position: { x: pos.x + 220, y: pos.y + i * 75 },
            exists: true,
          });
          edges.push({ from: screen.id, to: modal.id, label: "modal", dashed: true });
        }
        break;
      }
    }
  }

  // Infer auth flow edges (not in CSV parent_id, but logically required)
  const loginNode    = nodes.find((n) => /로그인|login/i.test(n.label));
  const denyNode     = nodes.find((n) => /접근|거부|deny|unauthorized/i.test(n.label));
  const consentNode  = nodes.find((n) => /약관|동의|consent|terms/i.test(n.label));
  const firstScreen  = nodes.find((n) => n.authRequired && !n.parentId && n.role !== "shared");

  if (loginNode) {
    // login → 이용약관동의 (first time)
    if (consentNode && consentNode.id !== loginNode.id) {
      edges.push({ from: loginNode.id, to: consentNode.id, label: "첫 로그인", dashed: true });
    }
    // login → 메인 화면 (기존 계정)
    if (firstScreen) {
      edges.push({ from: loginNode.id, to: firstScreen.id, label: "로그인 성공", dashed: true });
    }
    // login → 접근거부
    if (denyNode && denyNode.id !== loginNode.id) {
      edges.push({ from: loginNode.id, to: denyNode.id, label: "미허용 계정", dashed: true });
    }
  }
  // 이용약관동의 → 메인 화면
  if (consentNode && firstScreen) {
    edges.push({ from: consentNode.id, to: firstScreen.id, label: "동의 완료", dashed: true });
  }

  const maxX = Math.max(...nodes.map((n) => n.position.x)) + 260;
  const maxY = Math.max(...nodes.map((n) => n.position.y)) + 140;

  return NextResponse.json({ nodes, edges, canvasSize: { width: maxX, height: maxY } } satisfies GraphData & { canvasSize: { width: number; height: number } });
}
