'use client';

import { useState } from 'react';

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <span>Demo Application — Simulated GPS Data</span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-4 text-amber-100 hover:text-white text-xs underline"
      >
        Dismiss
      </button>
    </div>
  );
}
