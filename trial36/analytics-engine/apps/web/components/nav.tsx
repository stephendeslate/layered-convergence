'use client';

import Link from 'next/link';

// TRACED: AE-FE-004
export function Nav() {
  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
      }}
    >
      <Link
        href="/"
        style={{ fontWeight: 700, fontSize: '1.125rem', textDecoration: 'none', color: 'var(--foreground)' }}
      >
        Analytics Engine
      </Link>
      <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
        <Link href="/dashboards" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>
          Dashboards
        </Link>
        <Link href="/pipelines" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>
          Pipelines
        </Link>
        <Link href="/reports" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>
          Reports
        </Link>
      </div>
    </nav>
  );
}
