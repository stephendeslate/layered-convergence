// [TRACED:EM-UI-004] Nav component in layout
export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" className="text-lg font-bold">Escrow Marketplace</a>
        <div className="flex items-center gap-4">
          <a href="/transactions" className="text-sm hover:underline">Transactions</a>
          <a href="/disputes" className="text-sm hover:underline">Disputes</a>
          <a href="/payouts" className="text-sm hover:underline">Payouts</a>
          <a href="/webhooks" className="text-sm hover:underline">Webhooks</a>
          <a href="/login" className="text-sm hover:underline">Login</a>
        </div>
      </div>
    </nav>
  );
}
