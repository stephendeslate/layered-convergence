import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import './globals.css';

// TRACED: EM-FE-003 — Dark mode via prefers-color-scheme (globals.css)
// TRACED: EM-FE-005 — Root layout with Nav and metadata

export const metadata: Metadata = {
  title: 'Escrow Marketplace',
  description: 'A secure multi-tenant escrow marketplace platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Nav />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
