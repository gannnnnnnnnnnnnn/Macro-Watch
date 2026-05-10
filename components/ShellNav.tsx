"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { moduleForPath, modules, type MacroWatchModule } from "@/lib/modules";

const groupLabels: Record<MacroWatchModule["group"], string> = {
  core: "Core",
  research: "Research",
  data: "Data",
  future: "Future",
};

export function ShellNav() {
  const pathname = usePathname();
  const activeModule = moduleForPath(pathname);
  const grouped = (["core", "research", "data", "future"] as const).map((group) => ({
    group,
    items: modules.filter((module) => module.group === group),
  }));

  return (
    <nav className="flex min-w-0 gap-2 overflow-x-auto px-3 pb-4 text-sm text-slate-300 lg:block lg:max-h-[calc(100vh-280px)] lg:space-y-5 lg:overflow-y-auto lg:pr-2">
      {grouped.map(({ group, items }) => (
        <div key={group} className="flex shrink-0 gap-1 lg:block lg:space-y-1">
          <p className="hidden px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600 lg:block">{groupLabels[group]}</p>
          {items.map((item) => {
            const active = activeModule?.id === item.id;
            if (!item.href) {
              return (
                <div
                  key={item.id}
                  aria-disabled="true"
                  title={item.description}
                  className="block whitespace-nowrap rounded border border-transparent px-3 py-2 text-slate-600 lg:whitespace-normal"
                >
                  <span>{item.label}</span>
                  {item.badge ? <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase text-slate-500">{item.badge}</span> : null}
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.description}
                className={`block whitespace-nowrap rounded border px-3 py-2 transition lg:whitespace-normal ${active ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100" : "border-transparent hover:border-line hover:bg-panel hover:text-white"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
