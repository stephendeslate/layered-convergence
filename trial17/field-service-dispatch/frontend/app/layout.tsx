import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Field Service Dispatch',
  description: 'Multi-tenant field service dispatch management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-md focus:shadow-lg">
          Skip to content
        </a>
        <nav aria-label="Main navigation" className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-xl font-bold">FSD</Link>
                <div className="hidden sm:flex gap-4">
                  <Link href="/work-orders" className="text-sm text-slate-600 hover:text-slate-900">Work Orders</Link>
                  <Link href="/technicians" className="text-sm text-slate-600 hover:text-slate-900">Technicians</Link>
                  <Link href="/routes" className="text-sm text-slate-600 hover:text-slate-900">Routes</Link>
                </div>
              </div>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="text-sm text-slate-600 hover:text-slate-900">Logout</button>
              </form>
            </div>
          </div>
        </nav>
        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
