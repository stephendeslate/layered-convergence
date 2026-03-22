// TRACED: FD-SA-005 — Navigation component with accessible links
import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/work-orders', label: 'Work Orders' },
  { href: '/technicians', label: 'Technicians' },
  { href: '/schedules', label: 'Schedules' },
  { href: '/service-areas', label: 'Service Areas' },
];

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b bg-[var(--card)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-[var(--primary)]">
          Field Service Dispatch
        </Link>
        <ul className="flex gap-6" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
