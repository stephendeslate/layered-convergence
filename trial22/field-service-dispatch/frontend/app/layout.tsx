// TRACED:UI-003 Nav in root layout with skip-to-content
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Field Service Dispatch',
  description: 'Multi-tenant field service dispatch platform',
};

function Navigation() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
        <Link href="/dashboard" className="font-bold text-lg text-[var(--primary)]">
          FSD
        </Link>
        <Link href="/dashboard" className="text-sm hover:text-[var(--primary)]">
          Dashboard
        </Link>
        <Link href="/work-orders" className="text-sm hover:text-[var(--primary)]">
          Work Orders
        </Link>
        <Link href="/customers" className="text-sm hover:text-[var(--primary)]">
          Customers
        </Link>
        <Link href="/technicians" className="text-sm hover:text-[var(--primary)]">
          Technicians
        </Link>
        <Link href="/invoices" className="text-sm hover:text-[var(--primary)]">
          Invoices
        </Link>
        <Link href="/routes" className="text-sm hover:text-[var(--primary)]">
          Routes
        </Link>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <Navigation />
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-[var(--border)] py-4 text-center text-sm text-[var(--muted-foreground)]">
          Field Service Dispatch
        </footer>
      </body>
    </html>
  );
}
