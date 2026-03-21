import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '../components/nav';

export const metadata: Metadata = {
  title: 'Escrow Marketplace',
  description: 'Transaction escrow with disputes, payouts, and webhooks',
};

// [TRACED:UI-005] Root layout with Nav component and skip-to-content link
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-to-content">
          <span className="sr-only">Skip to main content</span>
          Skip to main content
        </a>
        <Nav />
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
