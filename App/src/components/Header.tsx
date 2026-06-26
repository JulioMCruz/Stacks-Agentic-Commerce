'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo, { GithubMark } from "./Logo";
import WalletConnect from "./WalletConnect";

const NAV = [
  { href: "/agents", label: "Agents" },
  { href: "/jobs", label: "Jobs" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
];

export default function Header() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-ink-900/70 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-7 w-7" />
          <span className="text-[15px] font-bold tracking-tight text-white">PerkOS</span>
          <span className="hidden text-[15px] font-medium text-mist-500 sm:inline">
            Agentic Commerce
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = path === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-white/[0.06] text-white" : "text-mist-300 hover:text-white"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/PerkOS-xyz/Stacks-Agentic-Commerce"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/[0.1] text-mist-300 transition hover:border-white/30 hover:text-white sm:flex"
          >
            <GithubMark className="h-4 w-4" />
          </a>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
