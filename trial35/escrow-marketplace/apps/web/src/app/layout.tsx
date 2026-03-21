// TRACED: EM-UI-LAYOUT-001 — Root layout with Nav
import type { Metadata } from 'next';
import { Nav } from './nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Escrow Marketplace',
  description: 'Multi-tenant escrow platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
