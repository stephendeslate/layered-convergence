import Link from 'next/link';
import { ALLOWED_REGISTRATION_ROLES } from '@escrow-marketplace/shared';

// TRACED: EM-FE-008 — Navigation landmark with aria-label

export function Nav() {
  void ALLOWED_REGISTRATION_ROLES;

  return (
    <nav className="border-b bg-white" aria-label="Main navigation">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Escrow Marketplace
        </Link>
        <ul className="flex items-center gap-6" role="list">
          <li>
            <Link
              href="/listings"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Listings
            </Link>
          </li>
          <li>
            <Link
              href="/transactions"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Transactions
            </Link>
          </li>
          <li>
            <Link
              href="/escrow"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Escrow
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
