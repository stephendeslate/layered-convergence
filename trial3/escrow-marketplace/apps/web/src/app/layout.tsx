import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Escrow Marketplace',
  description: 'Secure escrow payment platform for two-sided marketplaces',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <h1 className="text-xl font-bold text-emerald-600">Escrow Marketplace</h1>
            <nav className="flex gap-6 text-sm">
              <a href="/transactions" className="hover:text-emerald-600">Transactions</a>
              <a href="/disputes" className="hover:text-emerald-600">Disputes</a>
              <a href="/payouts" className="hover:text-emerald-600">Payouts</a>
              <a href="/settings" className="hover:text-emerald-600">Settings</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
