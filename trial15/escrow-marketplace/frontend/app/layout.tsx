import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { fetchCurrentUser } from "@/lib/api";
import type { User } from "@/lib/types";
import "./globals.css";

export const metadata: Metadata = {
  title: "Escrow Marketplace",
  description: "Secure two-sided marketplace with payment escrow",
};

async function NavUser() {
  const user: User | null = await fetchCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">
        {user.name}{" "}
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          {user.role}
        </span>
      </span>
    </div>
  );
}

function NavLinks() {
  return (
    <nav className="flex items-center gap-6" aria-label="Main navigation">
      <Link
        href="/"
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        Dashboard
      </Link>
      <Link
        href="/transactions"
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        Transactions
      </Link>
      <Link
        href="/transactions/create"
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        New Transaction
      </Link>
      <Link
        href="/disputes"
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        Disputes
      </Link>
      <Link
        href="/payouts"
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        Payouts
      </Link>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                EscrowMarket
              </Link>
              <NavLinks />
            </div>
            <Suspense
              fallback={
                <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
              }
            >
              <NavUser />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
