"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const icon = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

const TABS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/", label: "Log", icon: <svg {...icon}><path d="M12 5v14M5 12h14" /></svg> },
  { href: "/history", label: "History", icon: <svg {...icon}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg> },
  { href: "/stats", label: "Stats", icon: <svg {...icon}><path d="M6 20V10M12 20V4M18 20v-7" /></svg> },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="tab-bar-position fixed inset-x-0 z-10 flex justify-center px-5">
      <ul className="glass flex w-full max-w-md justify-around rounded-full p-1.5">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-full text-xs font-semibold ${
                  active ? "bg-accent text-on-accent" : "text-ink-muted"
                }`}
              >
                {tab.icon}
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
