import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ARTIFACT_FILES: Record<string, string[]> = {
  PRD: ["PRD.md"],
  IA: ["IA_Structure.csv"],
  Screen_Specs: ["Screen_Specs_user.md", "Screen_Specs_shared.md", "Screen_Specs_admin.md", "Screen_Specs.md"],
  Sprint_Backlog: ["Sprint_Backlog.json"],
  ERD: ["ERD.md"],
  Policy: ["Policy.md"],
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ project: string; artifact: string }> }
) {
  const { project, artifact } = await params;
  const base = process.env.OUTPUT_BASE_PATH ?? path.join(process.cwd(), "data");
  if (!base) return NextResponse.json({ error: "OUTPUT_BASE_PATH not set" }, { status: 500 });

  const candidates = ARTIFACT_FILES[artifact];
  if (!candidates) return NextResponse.json({ error: "Unknown artifact" }, { status: 400 });

  const dir = path.join(base, project);
  for (const file of candidates) {
    const fp = path.join(dir, file);
    try {
      const content = fs.readFileSync(fp, "utf-8");
      const ext = path.extname(file).slice(1);
      return NextResponse.json({ content, ext, file });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: "File not found" }, { status: 404 });
}
