"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";

const nav = [
  { href: "/", key: "dashboard" },
  { href: "/markets", key: "markets" },
  { href: "/macro", key: "macro" },
  { href: "/stress", key: "stress" },
  { href: "/data-lab", key: "dataLab" },
];

export function ShellNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  return (
    <nav className="flex min-w-0 gap-1 overflow-x-auto px-3 pb-4 text-sm text-slate-300 lg:block lg:space-y-1 lg:overflow-visible">
      {nav.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block whitespace-nowrap rounded-lg border px-3 py-2 transition ${active ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100" : "border-transparent hover:border-line hover:bg-panel hover:text-white"}`}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
