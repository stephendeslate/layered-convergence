import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Embeddable analytics dashboard platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="flex min-h-screen">
          <nav className="w-64 border-r border-gray-200 bg-white p-6">
            <h1 className="mb-8 text-xl font-bold text-blue-600">Analytics Engine</h1>
            <ul className="space-y-2">
              <li>
                <a href="/dashboards" className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Dashboards
                </a>
              </li>
              <li>
                <a href="/data-sources" className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Data Sources
                </a>
              </li>
              <li>
                <a href="/settings" className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Settings
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
