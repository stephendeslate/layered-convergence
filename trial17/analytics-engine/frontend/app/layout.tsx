import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Analytics Engine',
  description: 'Multi-tenant analytics platform for data visualization and monitoring',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:underline"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-40 border-b bg-background">
          <nav aria-label="Main navigation" className="container mx-auto flex h-14 items-center gap-6 px-4">
            <a href="/" className="text-lg font-bold">
              Analytics Engine
            </a>
            <a
              href="/data-sources"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Data Sources
            </a>
            <a
              href="/pipelines"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pipelines
            </a>
            <a
              href="/dashboards"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboards
            </a>
            <a
              href="/embeds"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Embeds
            </a>
          </nav>
        </header>
        <main id="main-content" className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
