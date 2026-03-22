import { cn } from '../lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboards', label: 'Dashboards' },
  { href: '/pipelines', label: 'Pipelines' },
  { href: '/reports', label: 'Reports' },
];

export function Nav({ className }: { className?: string }) {
  return (
    <nav
      className={cn(
        'border-b border-[var(--border)] bg-[var(--background)]',
        className,
      )}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <span className="text-lg font-semibold">AE</span>
        <ul className="flex gap-4" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
