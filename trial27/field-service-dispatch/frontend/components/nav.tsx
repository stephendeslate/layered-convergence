// [TRACED:FD-036] Nav component with links to Work Orders, Login, Register
import Link from "next/link";

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-[var(--primary)]">
          Field Service Dispatch
        </Link>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="text-[var(--foreground)] hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            Work Orders
          </Link>
          <Link
            href="/login"
            className="text-[var(--foreground)] hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-[var(--foreground)] hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
