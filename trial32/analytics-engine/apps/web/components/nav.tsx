// [TRACED:AE-UI-004] Nav component in root layout
import Link from 'next/link';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b bg-[var(--background)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold">
          Analytics Engine
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
          <Link href="/pipelines" className="text-sm hover:underline">Pipelines</Link>
          <Link href="/data-sources" className="text-sm hover:underline">Data Sources</Link>
          <Link href="/data-points" className="text-sm hover:underline">Data Points</Link>
          <Link href="/sync-runs" className="text-sm hover:underline">Sync Runs</Link>
          <Link href="/widgets" className="text-sm hover:underline">Widgets</Link>
          <Link href="/embeds" className="text-sm hover:underline">Embeds</Link>
          <Link href="/login" className="text-sm hover:underline">Login</Link>
        </div>
      </div>
    </nav>
  );
}
