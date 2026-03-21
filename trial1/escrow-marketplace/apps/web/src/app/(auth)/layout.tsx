'use client';

import { DemoBanner } from '@/components/layout/demo-banner';
import { Providers } from '@/app/providers';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <DemoBanner />
      <div className="flex min-h-[calc(100vh-40px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </Providers>
  );
}
