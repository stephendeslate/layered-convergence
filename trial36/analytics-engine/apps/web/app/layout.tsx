import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import './globals.css';

// TRACED: AE-FE-003
export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Data analytics platform for managing dashboards, pipelines, and reports',
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
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
