// [TRACED:UI-005] Root layout with Nav component and skip-to-content link
import './globals.css';
import { Nav } from '../components/nav';

export const metadata = {
  title: 'Field Service Dispatch',
  description: 'Work order management, technician dispatch, route planning, and invoice tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="sr-only">
          Skip to content
        </a>
        <Nav />
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
