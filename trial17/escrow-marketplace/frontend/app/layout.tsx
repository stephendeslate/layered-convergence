import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Escrow Marketplace',
  description: 'Secure multi-tenant escrow marketplace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <header className="border-b">
          <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-bold text-lg">
              Escrow Marketplace
            </Link>
            <Link href="/transactions" className="text-sm hover:underline">
              Transactions
            </Link>
            <Link href="/disputes" className="text-sm hover:underline">
              Disputes
            </Link>
            <Link href="/payouts" className="text-sm hover:underline">
              Payouts
            </Link>
            <div className="ml-auto flex gap-4">
              <Link href="/login" className="text-sm hover:underline">
                Login
              </Link>
              <Link href="/register" className="text-sm hover:underline">
                Register
              </Link>
            </div>
          </nav>
        </header>
        <main id="main-content" className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
