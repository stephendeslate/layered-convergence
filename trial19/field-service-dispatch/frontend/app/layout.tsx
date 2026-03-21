import type { Metadata } from 'next';
import './globals.css';
import { cookies } from 'next/headers';
import { Nav } from '@/components/nav';
import type { User } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Field Service Dispatch',
  description: 'Multi-tenant field service dispatch system',
};

async function getUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user')?.value;
  if (!userCookie) return null;
  try {
    return JSON.parse(userCookie) as User;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:rounded focus:border"
        >
          Skip to content
        </a>
        {user && <Nav user={user} />}
        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
