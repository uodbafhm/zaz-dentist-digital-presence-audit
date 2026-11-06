import Link from "next/link";
import { LayoutDashboard, ScanSearch, Sparkles } from "lucide-react";
import { Logo } from "@/components/bits";

export default function Navbar() {
  return (
    <header className="print-hidden sticky top-0 z-50 border-b-2 border-ink/90 bg-bone/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="MAPSO.RADAR">
          <Logo />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-6">
          <Link
            href="/"
            className="hidden items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-brand sm:flex"
          >
            <LayoutDashboard className="size-4" />
            لوحة القيادة
          </Link>
          <Link
            href="/#common-gaps"
            className="hidden items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-brand md:flex"
          >
            <Sparkles className="size-4" />
            النواقص الشائعة
          </Link>
          <Link
            href="/new"
            className="group flex items-center gap-2 rounded-full border-2 border-ink bg-brand px-4 py-2 text-sm font-bold text-white shadow-hard-sm transition-all hover:-translate-y-0.5 hover:bg-brand-deep"
          >
            <ScanSearch className="size-4 transition-transform group-hover:rotate-12" />
            فحص جديد
          </Link>
        </nav>
      </div>
    </header>
  );
}
