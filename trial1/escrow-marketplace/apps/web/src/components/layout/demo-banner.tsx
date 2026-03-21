'use client';

import { DEMO_BANNER_TEXT } from '@cpm/shared';

export function DemoBanner() {
  return (
    <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center text-sm text-yellow-800">
      <span className="font-medium">{DEMO_BANNER_TEXT}</span>
      <span className="hidden sm:inline"> — Use test card 4242 4242 4242 4242</span>
    </div>
  );
}
