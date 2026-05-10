export type ModuleStatus = "active" | "preview" | "future" | "disabled";

export type MacroWatchModule = {
  id: string;
  label: string;
  href?: string;
  group: "core" | "research" | "data" | "future";
  status: ModuleStatus;
  description: string;
  badge?: string;
};

export const modules: MacroWatchModule[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    group: "core",
    status: "active",
    description: "Research home and macro pulse.",
  },
  {
    id: "markets",
    label: "Markets",
    href: "/markets",
    group: "core",
    status: "active",
    description: "Asset explorer and local charts.",
  },
  {
    id: "macro",
    label: "Macro",
    href: "/macro",
    group: "core",
    status: "active",
    description: "Rates, inflation, growth, and liquidity.",
  },
  {
    id: "stress",
    label: "Stress",
    href: "/stress",
    group: "core",
    status: "active",
    description: "Context-only stress diagnostics.",
  },
  {
    id: "library",
    label: "Evidence Library",
    href: "/library",
    group: "research",
    status: "active",
    description: "Deterministic evidence references.",
  },
  {
    id: "data-source-center",
    label: "Data Source Center",
    href: "/data-lab",
    group: "data",
    status: "active",
    description: "Generated/mock data control tower.",
  },
  {
    id: "research-notes",
    label: "Research Notes",
    group: "future",
    status: "disabled",
    description: "Local notes and observation logs.",
    badge: "future",
  },
  {
    id: "trader-reader",
    label: "Trader Reader",
    group: "future",
    status: "disabled",
    description: "Future article and claim ingestion.",
    badge: "future",
  },
  {
    id: "thesis-lab",
    label: "Thesis Lab",
    group: "future",
    status: "disabled",
    description: "Future thesis validation workspace.",
    badge: "future",
  },
  {
    id: "cycle-atlas",
    label: "Cycle Atlas",
    group: "future",
    status: "disabled",
    description: "Future cycle evidence view.",
    badge: "future",
  },
  {
    id: "ai-research",
    label: "AI Research",
    group: "future",
    status: "disabled",
    description: "Future evidence-aware AI analysis.",
    badge: "future",
  },
  {
    id: "research-workspace",
    label: "Research Workspace",
    group: "future",
    status: "disabled",
    description: "Future multi-module workspace.",
    badge: "future",
  },
  {
    id: "flow-builder",
    label: "Flow Builder",
    group: "future",
    status: "disabled",
    description: "Future research flow design.",
    badge: "future",
  },
];

export function getActiveModules() {
  return modules.filter((module) => module.status === "active" && module.href);
}

export function getFutureModules() {
  return modules.filter((module) => module.group === "future" || module.status === "future" || module.status === "disabled");
}

export function moduleForPath(pathname: string) {
  const activeModules = getActiveModules().sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0));
  return activeModules.find((module) => {
    if (!module.href) return false;
    return module.href === "/" ? pathname === "/" : pathname === module.href || pathname.startsWith(`${module.href}/`);
  });
}
