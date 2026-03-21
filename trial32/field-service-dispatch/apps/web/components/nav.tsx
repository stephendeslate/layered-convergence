// [TRACED:FD-UI-004] Nav component in layout
export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" className="text-lg font-bold">Field Service Dispatch</a>
        <div className="flex items-center gap-4">
          <a href="/work-orders" className="text-sm hover:underline">Work Orders</a>
          <a href="/customers" className="text-sm hover:underline">Customers</a>
          <a href="/technicians" className="text-sm hover:underline">Technicians</a>
          <a href="/routes" className="text-sm hover:underline">Routes</a>
          <a href="/invoices" className="text-sm hover:underline">Invoices</a>
          <a href="/login" className="text-sm hover:underline">Login</a>
        </div>
      </div>
    </nav>
  );
}
