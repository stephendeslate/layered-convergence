'use client';

import Link from 'next/link';
import { truncate } from '@analytics-engine/shared';

// TRACED: AE-UI-NAV-001 — Navigation component with aria-label
// TRACED: AE-CQ-TRUNC-002 — truncate used in frontend nav for long titles
export function Nav() {
  const projectTitle = truncate('Analytics Engine Dashboard Platform', 25);

  return (
    <nav aria-label="Main navigation" className="border-b bg-background px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-semibold">
          {projectTitle}
        </Link>
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
          Dashboard
        </Link>
        <Link href="/pipelines" className="text-muted-foreground hover:text-foreground">
          Pipelines
        </Link>
        <Link href="/reports" className="text-muted-foreground hover:text-foreground">
          Reports
        </Link>
        <Link href="/settings" className="text-muted-foreground hover:text-foreground">
          Settings
        </Link>
      </div>
    </nav>
  );
}
