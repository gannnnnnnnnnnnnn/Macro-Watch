"use client";

import { useEffect, useState } from "react";

type WorkspaceItemType = "asset" | "indicator" | "stressBucket" | "evidence";

type WorkspaceState = {
  assets: string[];
  indicators: string[];
  stressBuckets: string[];
  evidenceIds: string[];
  thesisTitle?: string;
};

const STORAGE_KEY = "macro-watch:workspace:v1";

const emptyWorkspace: WorkspaceState = {
  assets: [],
  indicators: [],
  stressBuckets: [],
  evidenceIds: [],
};

function readWorkspace(): WorkspaceState {
  if (typeof window === "undefined") return emptyWorkspace;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<WorkspaceState>;
    return {
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
      indicators: Array.isArray(parsed.indicators) ? parsed.indicators : [],
      stressBuckets: Array.isArray(parsed.stressBuckets) ? parsed.stressBuckets : [],
      evidenceIds: Array.isArray(parsed.evidenceIds) ? parsed.evidenceIds : [],
      thesisTitle: typeof parsed.thesisTitle === "string" ? parsed.thesisTitle : undefined,
    };
  } catch {
    return emptyWorkspace;
  }
}

function keyFor(type: WorkspaceItemType): keyof Pick<WorkspaceState, "assets" | "indicators" | "stressBuckets" | "evidenceIds"> {
  if (type === "asset") return "assets";
  if (type === "indicator") return "indicators";
  if (type === "stressBucket") return "stressBuckets";
  return "evidenceIds";
}

export function AddToWorkspaceButton({ type, id, label }: { type: WorkspaceItemType; id: string; label?: string }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const workspace = readWorkspace();
    setAdded(workspace[keyFor(type)].includes(id));
  }, [id, type]);

  function add() {
    const workspace = readWorkspace();
    const key = keyFor(type);
    const next: WorkspaceState = {
      ...workspace,
      [key]: workspace[key].includes(id) ? workspace[key] : [...workspace[key], id],
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("macro-watch:workspace-updated"));
    setAdded(true);
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={added}
      className={`rounded border px-3 py-2 text-sm transition ${
        added ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-cyan-400/30 text-cyan-200 hover:bg-panel hover:text-white"
      }`}
      title={label ? `Add ${label} to workspace` : "Add to workspace"}
    >
      {added ? "In workspace" : "Add to workspace"}
    </button>
  );
}
