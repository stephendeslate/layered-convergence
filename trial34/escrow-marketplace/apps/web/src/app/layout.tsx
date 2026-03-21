import type { Metadata } from 'next';
import { Nav } from './nav';
import './globals.css';

// TRACED: EM-UI-LAYOUT-001 — Root layout with Nav and skip-to-content
export const metadata: Metadata = {
  title: 'Escrow Marketplace',
  description: 'Secure escrow-based marketplace platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
