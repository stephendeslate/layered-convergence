// [TRACED:AE-036] Navigation component used in root layout
import Link from "next/link";

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold">
          Analytics Engine
        </Link>
        <div className="flex gap-4">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/login" className="hover:underline">
            Login
          </Link>
          <Link href="/register" className="hover:underline">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
