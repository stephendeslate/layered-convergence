import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Analytics Engine",
  description:
    "Multi-tenant analytics platform for data ingestion, pipeline orchestration, and dashboard management",
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/data-sources", label: "Data Sources" },
  { href: "/dashboards", label: "Dashboards" },
  { href: "/pipelines", label: "Pipelines" },
  { href: "/embeds", label: "Embeds" },
];

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth-token")?.value;
  const isAuthenticated = Boolean(authToken);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="flex min-h-screen">
          {isAuthenticated && (
            <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
              <div className="flex h-16 items-center border-b px-6">
                <Link
                  href="/"
                  className="text-lg font-bold tracking-tight text-foreground"
                >
                  Analytics Engine
                </Link>
              </div>
              <nav className="flex flex-col gap-1 p-4" aria-label="Main navigation">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto border-t p-4">
                <form action="/api/logout" method="POST">
                  <button
                    type="submit"
                    className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </aside>
          )}
          <div className="flex flex-1 flex-col">
            {isAuthenticated && (
              <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background px-6 md:hidden">
                <Link
                  href="/"
                  className="text-lg font-bold tracking-tight text-foreground"
                >
                  Analytics Engine
                </Link>
                <nav className="ml-6 flex items-center gap-4" aria-label="Mobile navigation">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </header>
            )}
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
