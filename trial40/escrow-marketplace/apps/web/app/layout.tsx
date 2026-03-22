// TRACED: EM-FE-001 — Root layout with Nav component
import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '../components/nav';

export const metadata: Metadata = {
  title: 'Escrow Marketplace',
  description: 'Multi-tenant escrow platform',
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
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
