import type { Metadata } from 'next';
import './globals.css';
import { cookies } from 'next/headers';
import { logoutAction } from './actions';
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
      <body className="min-h-screen bg-gray-50">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to content
        </a>
        {user && (
          <nav aria-label="Main navigation" className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex space-x-8">
                  <a href="/work-orders" className="text-gray-900 hover:text-blue-600 font-medium">
                    Work Orders
                  </a>
                  <a href="/technicians" className="text-gray-900 hover:text-blue-600 font-medium">
                    Technicians
                  </a>
                  <a href="/routes" className="text-gray-900 hover:text-blue-600 font-medium">
                    Routes
                  </a>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{user.email} ({user.role})</span>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="text-sm text-red-600 hover:text-red-800"
                      aria-label="Log out"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </nav>
        )}
        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
