import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Field Service Dispatch',
  description: 'Multi-tenant field service management with GPS tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="flex min-h-screen">
          <nav className="w-64 border-r border-gray-200 bg-white p-6">
            <h1 className="mb-8 text-xl font-bold text-orange-600">Field Service</h1>
            <ul className="space-y-2">
              <li>
                <a href="/" className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/work-orders" className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Work Orders
                </a>
              </li>
              <li>
                <a href="/technicians" className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Technicians
                </a>
              </li>
              <li>
                <a href="/map" className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Live Map
                </a>
              </li>
              <li>
                <a href="/invoices" className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Invoices
                </a>
              </li>
              <li>
                <a href="/analytics" className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Analytics
                </a>
              </li>
            </ul>
          </nav>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
