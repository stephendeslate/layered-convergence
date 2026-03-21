import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '../components/nav';

export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Multi-tenant analytics with pipelines, dashboards, and data sources',
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
