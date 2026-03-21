import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Escrow Marketplace',
  description: 'Secure peer-to-peer escrow transactions',
};

// TRACED:UI-003: Skip-to-content link in root layout
// TRACED:SA-002: Frontend uses Next.js 15 App Router
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-[var(--background)] focus:text-[var(--foreground)]"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
