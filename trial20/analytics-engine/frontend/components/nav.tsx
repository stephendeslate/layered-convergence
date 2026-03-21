import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b bg-[var(--card)] px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-lg font-bold">
          Analytics Engine
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboards">
            <Button variant="ghost" size="sm">Dashboards</Button>
          </Link>
          <Link href="/data-sources">
            <Button variant="ghost" size="sm">Data Sources</Button>
          </Link>
          <Link href="/pipelines">
            <Button variant="ghost" size="sm">Pipelines</Button>
          </Link>
          <Link href="/widgets">
            <Button variant="ghost" size="sm">Widgets</Button>
          </Link>
          <Link href="/embeds">
            <Button variant="ghost" size="sm">Embeds</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
