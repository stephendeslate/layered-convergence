// TRACED: EM-FE-003 — Root layout with Nav component
import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Escrow Marketplace',
  description: 'Secure multi-tenant escrow marketplace platform',
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
