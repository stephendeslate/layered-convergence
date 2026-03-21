import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/nav';

export const metadata: Metadata = {
  title: 'Escrow Marketplace',
  description: 'Multi-user escrow marketplace platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:border focus:rounded"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main-content" className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
