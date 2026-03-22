// TRACED: FD-SA-001 — Service areas list page
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceArea {
  id: string;
  name: string;
}

export default function ServiceAreasPage() {
  const serviceAreas: ServiceArea[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Service Areas</h1>
        <p className="text-[var(--muted-foreground)]">
          Manage geographic service coverage areas.
        </p>
      </div>

      {serviceAreas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-[var(--muted-foreground)]">
            No service areas found. Connect to the API to load data.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceAreas.map((area) => (
            <Card key={area.id}>
              <CardHeader>
                <CardTitle className="text-lg">{area.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-[var(--muted-foreground)]">{area.id}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
