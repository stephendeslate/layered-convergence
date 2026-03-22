// TRACED:AE-FE-02 — Root layout with Nav component
// TRACED:AE-ARCH-08 — Multi-tenant domain model reflected in navigation structure

import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Multi-tenant analytics platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
