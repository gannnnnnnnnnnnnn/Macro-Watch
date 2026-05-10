import Link from "next/link";
import { getCockpitData } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { LanguageToggle, LocalizedText } from "./LanguageProvider";
import { ShellNav } from "./ShellNav";
import { SourceBadge } from "./Cockpit";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { source, pipelineStatus } = getCockpitData();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="w-screen max-w-full min-w-0 overflow-hidden border-b border-line bg-[#080b12]/95 lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:border-b-0 lg:border-r lg:overflow-visible">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded border border-cyan-400/30 bg-cyan-400/10 text-sm font-semibold text-cyan-200">MW</span>
            <span>
              <span className="block font-semibold text-white">Macro-Watch</span>
              <span className="block text-xs text-slate-500"><LocalizedText id="localCockpit" fallback="Local macro cockpit" /></span>
            </span>
          </Link>
        </div>
        <ShellNav />
        <div className="px-3 pb-4 lg:hidden">
          <LanguageToggle />
        </div>
        <div className="hidden border-t border-line p-4 lg:block">
          <div className="mb-3 rounded border border-line bg-ink p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Data</p>
              <SourceBadge source={source} />
            </div>
            <p className="break-words text-xs text-slate-500">{pipelineStatus.generated_at ? formatDateTime(pipelineStatus.generated_at) : "Generated status missing"}</p>
            <Link href="/data-lab" className="mt-2 inline-block text-xs font-medium text-cyan-300 hover:text-cyan-100">
              Data Source Center
            </Link>
          </div>
          <LanguageToggle />
        </div>
      </aside>
      <div className="w-screen max-w-full min-w-0 overflow-x-hidden lg:w-auto">
        <main className="mx-auto w-screen max-w-full overflow-x-hidden px-4 py-6 sm:py-8 lg:w-auto lg:max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
