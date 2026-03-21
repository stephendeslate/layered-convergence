import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const sections = [
    { title: 'Work Orders', description: 'Manage service requests and track progress', href: '/work-orders' },
    { title: 'Customers', description: 'View and manage customer information', href: '/customers' },
    { title: 'Technicians', description: 'Track technician availability and assignments', href: '/technicians' },
    { title: 'Routes', description: 'Plan and optimize service routes', href: '/routes' },
    { title: 'Invoices', description: 'Create and track invoices for completed work', href: '/invoices' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Field Service Dispatch</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <a key={section.href} href={section.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--muted-foreground)]">View all {section.title.toLowerCase()}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
