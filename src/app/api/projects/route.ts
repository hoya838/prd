import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export type ArtifactStatus = {
  exists: boolean;
  mtime: string | null;
};

export type ProjectInfo = {
  name: string;
  artifacts: {
    PRD: ArtifactStatus;
    IA: ArtifactStatus;
    Screen_Specs: ArtifactStatus;
    Sprint_Backlog: ArtifactStatus;
    ERD: ArtifactStatus;
    Policy: ArtifactStatus;
  };
};

const ARTIFACT_FILES: Record<string, string> = {
  PRD: "PRD.md",
  IA: "IA_Structure.csv",
  Screen_Specs: "Screen_Specs_user.md",
  Sprint_Backlog: "Sprint_Backlog.json",
  ERD: "ERD.md",
  Policy: "Policy.md",
};

function stat(filePath: string): ArtifactStatus {
  try {
    const s = fs.statSync(filePath);
    return { exists: true, mtime: s.mtime.toISOString() };
  } catch {
    return { exists: false, mtime: null };
  }
}

export async function GET() {
  const base = process.env.OUTPUT_BASE_PATH ?? path.join(process.cwd(), "data");
  if (!base) return NextResponse.json({ error: "OUTPUT_BASE_PATH not set" }, { status: 500 });

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(base, { withFileTypes: true });
  } catch {
    return NextResponse.json({ error: "Cannot read OUTPUT_BASE_PATH" }, { status: 500 });
  }

  const projects: ProjectInfo[] = entries
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => {
      const dir = path.join(base, e.name);
      const artifacts = Object.fromEntries(
        Object.entries(ARTIFACT_FILES).map(([key, file]) => [key, stat(path.join(dir, file))])
      ) as ProjectInfo["artifacts"];
      return { name: e.name, artifacts };
    });

  return NextResponse.json({ projects });
}
