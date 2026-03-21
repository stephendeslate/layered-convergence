import type { Metadata } from 'next';
import Link from 'next/link';
import { LayoutDashboard, ClipboardList, PlusCircle, Users, MapPin } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Field Service Dispatch',
  description: 'Multi-tenant field service management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
        >
          Skip to content
        </a>
        <div className="flex min-h-screen">
          <aside className="w-64 border-r bg-muted/40 p-6 hidden md:block">
            <nav aria-label="Main navigation">
              <h2 className="text-lg font-semibold mb-6">Field Service</h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" aria-hidden={true} />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/work-orders"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                  >
                    <ClipboardList className="h-4 w-4" aria-hidden={true} />
                    Work Orders
                  </Link>
                </li>
                <li>
                  <Link
                    href="/work-orders/new"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" aria-hidden={true} />
                    New Work Order
                  </Link>
                </li>
                <li>
                  <Link
                    href="/technicians"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                  >
                    <Users className="h-4 w-4" aria-hidden={true} />
                    Technicians
                  </Link>
                </li>
                <li>
                  <Link
                    href="/routes"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                  >
                    <MapPin className="h-4 w-4" aria-hidden={true} />
                    Routes
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
          <main id="main-content" className="flex-1 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
