import Link from "next/link";

// [TRACED:FE-006] Nav component in root layout
export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold">
          App
        </Link>
        <div className="flex gap-4">
          <Link href="/dashboard" className="text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded">
            Dashboard
          </Link>
          <Link href="/login" className="text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded">
            Login
          </Link>
          <Link href="/register" className="text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
