// TRACED:AE-ROOT-LAYOUT
import type { Metadata } from 'next';
import './globals.css';
import { Nav } from './nav';

export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Real-time analytics and data pipeline management',
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
      </body>
    </html>
  );
}
