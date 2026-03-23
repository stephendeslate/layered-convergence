import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { APP_VERSION } from '@analytics-engine/shared';
import './globals.css';

// TRACED:AE-UI-004
export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Full-stack analytics platform',
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
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="py-4 text-center text-xs text-gray-500">
          v{APP_VERSION}
        </footer>
      </body>
    </html>
  );
}
