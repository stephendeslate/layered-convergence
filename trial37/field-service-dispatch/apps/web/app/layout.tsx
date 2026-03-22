// TRACED: UI-BASE-001 — Base application layout
// TRACED: UI-LAYOUT-001 — Root layout structure
// TRACED: FD-UI-LAYOUT-001 — Root layout with Nav
// TRACED: FD-UI-BASE-001 — Base theme with CSS custom properties
import type { Metadata } from 'next';
import { Nav } from '../components/nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Field Service Dispatch',
  description: 'Multi-tenant field service dispatch platform',
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
