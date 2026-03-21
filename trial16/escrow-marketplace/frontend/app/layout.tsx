import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Escrow Marketplace',
  description: 'Secure two-sided escrow transactions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Skip to content
        </a>
        <nav className="border-b border-gray-200 bg-white" aria-label="Main navigation">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="text-xl font-bold">
              Escrow Marketplace
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/transactions"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Transactions
              </Link>
              <Link
                href="/disputes"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Disputes
              </Link>
              <Link
                href="/payouts"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Payouts
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>
            </div>
          </div>
        </nav>
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
