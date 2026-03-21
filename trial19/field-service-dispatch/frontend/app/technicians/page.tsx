import { fetchTechnicians } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAvailabilityBadgeVariant } from '@/lib/utils';

export default async function TechniciansPage() {
  const technicians = await fetchTechnicians();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Technicians</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {technicians.map((tech) => (
          <Card key={tech.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                <a href={`/technicians/${tech.id}`} className="hover:underline">
                  {tech.name}
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{tech.email}</p>
              <p className="text-sm text-muted-foreground">{tech.phone}</p>
              <div className="flex items-center gap-2">
                <Badge variant={getAvailabilityBadgeVariant(tech.availability)}>
                  {tech.availability.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {tech.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {technicians.length === 0 && (
          <p className="text-muted-foreground col-span-full">No technicians found.</p>
        )}
      </div>
    </div>
  );
}
