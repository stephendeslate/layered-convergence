// TRACED:AE-NAV-COMPONENT
import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b bg-white" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Analytics Engine
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Dashboards
          </Link>
          <Link
            href="/events"
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Events
          </Link>
          <Link
            href="/data-sources"
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Data Sources
          </Link>
          <Link
            href="/pipelines"
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Pipelines
          </Link>
          <Link
            href="/settings"
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
