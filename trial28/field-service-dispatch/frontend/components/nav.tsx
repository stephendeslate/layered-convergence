import Link from 'next/link';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-[var(--foreground)]">
          Field Service Dispatch
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Dashboard
          </Link>
          <Link href="/login" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Login
          </Link>
          <Link href="/register" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
