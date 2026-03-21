import Link from 'next/link';

// TRACED: AE-REQ-PIPE-002 — Navigation component in root layout
export function Nav() {
  return (
    <nav className="border-b bg-background" aria-label="Main navigation">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="text-lg font-semibold">
          Analytics Engine
        </Link>
        <div className="ml-8 flex gap-6">
          <Link href="/dashboard" className="text-sm hover:underline">
            Dashboard
          </Link>
          <Link href="/pipelines" className="text-sm hover:underline">
            Pipelines
          </Link>
          <Link href="/settings" className="text-sm hover:underline">
            Settings
          </Link>
          <Link href="/reports" className="text-sm hover:underline">
            Reports
          </Link>
        </div>
      </div>
    </nav>
  );
}
