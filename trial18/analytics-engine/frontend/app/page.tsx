import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics Engine</h1>
      <p className="text-muted-foreground mb-8">Multi-tenant analytics platform for data visualization and pipeline management.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboards" className="block p-6 border rounded-xl hover:bg-muted/50 transition-colors">
          <h2 className="font-semibold mb-1">Dashboards</h2>
          <p className="text-sm text-muted-foreground">Create and manage dashboards</p>
        </Link>
        <Link href="/data-sources" className="block p-6 border rounded-xl hover:bg-muted/50 transition-colors">
          <h2 className="font-semibold mb-1">Data Sources</h2>
          <p className="text-sm text-muted-foreground">Connect to your data</p>
        </Link>
        <Link href="/pipelines" className="block p-6 border rounded-xl hover:bg-muted/50 transition-colors">
          <h2 className="font-semibold mb-1">Pipelines</h2>
          <p className="text-sm text-muted-foreground">Process and transform data</p>
        </Link>
        <Link href="/embeds" className="block p-6 border rounded-xl hover:bg-muted/50 transition-colors">
          <h2 className="font-semibold mb-1">Embeds</h2>
          <p className="text-sm text-muted-foreground">Share dashboards externally</p>
        </Link>
      </div>
    </div>
  );
}
