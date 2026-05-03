// src/components/layout/Navbar.tsx
// top nav — logo + nav links + theme toggle
// kept deliberately minimal, the data should be the focus

import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BarChart2 } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <BarChart2
              size={18}
              className="text-accent/70 transition-colors group-hover:text-accent"
              strokeWidth={1.8}
            />
            <span className="font-ui text-sm font-semibold tracking-[0.18em] uppercase text-foreground">
              DevFlow
            </span>
          </Link>

          {/* nav links */}
          <nav className="hidden sm:flex items-center gap-6 text-xs tracking-[0.16em] uppercase font-label">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground hover:-translate-y-0.5 transition-all"
            >
              My Dashboard
            </Link>
            <Link
              href="/manager"
              className="text-muted-foreground hover:text-foreground hover:-translate-y-0.5 transition-all"
            >
              Team View
            </Link>
          </nav>

          {/* right side */}
          <div className="flex items-center gap-3">
            {/* mobile nav */}
            <nav className="flex sm:hidden items-center gap-4 text-xs uppercase tracking-[0.14em] font-label">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                IC
              </Link>
              <Link href="/manager" className="text-muted-foreground hover:text-foreground">
                Team
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
