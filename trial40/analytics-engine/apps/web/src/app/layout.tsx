// TRACED:AE-FE-05 — Root layout with Nav and metadata
import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Multi-tenant analytics platform for data insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
