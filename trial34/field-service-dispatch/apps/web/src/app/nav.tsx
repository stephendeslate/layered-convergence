'use client';

import Link from 'next/link';
import { truncate } from '@field-service-dispatch/shared';

// TRACED: FD-UI-NAV-001 — Navigation component with aria-label
// TRACED: FD-CQ-TRUNC-002 — truncate used in frontend nav for long titles
export function Nav() {
  const projectTitle = truncate('Field Service Dispatch Management', 25);

  return (
    <nav aria-label="Main navigation" className="border-b bg-background px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-semibold">
          {projectTitle}
        </Link>
        <Link href="/workorders" className="text-muted-foreground hover:text-foreground">
          Work Orders
        </Link>
        <Link href="/technicians" className="text-muted-foreground hover:text-foreground">
          Technicians
        </Link>
        <Link href="/schedule" className="text-muted-foreground hover:text-foreground">
          Schedule
        </Link>
        <Link href="/settings" className="text-muted-foreground hover:text-foreground">
          Settings
        </Link>
      </div>
    </nav>
  );
}
