import type { Metadata } from 'next';
import './globals.css';
import dynamic from 'next/dynamic';

// TRACED: FD-NEXT-DYNAMIC
const Nav = dynamic(() => import('./nav'), { ssr: true });

export const metadata: Metadata = {
  title: 'Field Service Dispatch',
  description: 'Manage work orders, technicians, schedules, and service areas',
};

// TRACED: FD-LAYOUT-NAV
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
