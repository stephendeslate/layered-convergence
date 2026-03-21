import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-border px-6 py-3 dark:border-border">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-lg">
          Analytics Engine
        </Link>
        <Link href="/dashboards" className="text-sm hover:underline">
          Dashboards
        </Link>
        <Link href="/data-sources" className="text-sm hover:underline">
          Data Sources
        </Link>
        <Link href="/pipelines" className="text-sm hover:underline">
          Pipelines
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
