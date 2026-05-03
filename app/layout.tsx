import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Macro-Watch",
  description: "Local-first macro research cockpit",
};

const nav = [
  ["/", "Home"],
  ["/markets", "Markets"],
  ["/macro", "Macro"],
  ["/stress", "Stress"],
  ["/data-lab", "Data Lab"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-slate-100">
        <header className="sticky top-0 z-20 border-b border-line bg-[#080b12]/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-wide text-white">
              <span className="grid h-8 w-8 place-items-center rounded border border-cyan-400/30 bg-cyan-400/10 text-sm text-cyan-200">MW</span>
              <span>Macro-Watch</span>
            </Link>
            <nav className="flex gap-1 overflow-x-auto text-sm text-slate-300">
              {nav.map(([href, label]) => (
                <Link key={href} href={href} className="rounded border border-transparent px-3 py-2 hover:border-line hover:bg-panel hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">{children}</main>
      </body>
    </html>
  );
}
