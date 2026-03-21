import type { Metadata } from 'next';
import { Nav } from './nav';
import './globals.css';

// TRACED: FD-UI-LAYOUT-001 — Root layout with Nav and skip-to-content
export const metadata: Metadata = {
  title: 'Field Service Dispatch',
  description: 'Multi-tenant field service management platform',
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
