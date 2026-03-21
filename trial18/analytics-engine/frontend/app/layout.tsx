import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Multi-tenant analytics platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:underline">
          Skip to content
        </a>
        <nav aria-label="Main navigation" className="border-b px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-lg">Analytics Engine</Link>
            <Link href="/dashboards" className="text-sm hover:underline">Dashboards</Link>
            <Link href="/data-sources" className="text-sm hover:underline">Data Sources</Link>
            <Link href="/pipelines" className="text-sm hover:underline">Pipelines</Link>
            <Link href="/embeds" className="text-sm hover:underline">Embeds</Link>
          </div>
        </nav>
        <main id="main-content" className="p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
