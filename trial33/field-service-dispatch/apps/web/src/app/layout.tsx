import type { Metadata } from 'next';
import { Nav } from './nav';

export const metadata: Metadata = {
  title: 'Field Service Dispatch',
  description: 'Field service management platform',
};

// TRACED: FD-REQ-MT-002 — Root layout with Nav component
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
