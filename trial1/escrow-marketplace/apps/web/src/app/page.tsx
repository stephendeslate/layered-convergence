'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DemoBanner } from '@/components/layout/demo-banner';
import { Providers } from '@/app/providers';
import { getAccessToken } from '@/lib/api';

function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      // Redirect to dashboard; role-based routing handled by dashboard layout
      router.push('/buyer');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <>
      <DemoBanner />
      <main className="flex min-h-[calc(100vh-40px)] flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold text-gray-900">
          Conditional Payment Marketplace
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Secure payment holds with conditional release via Stripe Connect
        </p>
        <div className="mt-8 flex gap-4">
          <a
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Register
          </a>
        </div>
      </main>
    </>
  );
}

export default function Page() {
  return (
    <Providers>
      <HomePage />
    </Providers>
  );
}
