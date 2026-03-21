import { fetchTechnician } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAvailabilityBadgeVariant } from '@/lib/utils';

export default async function TechnicianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const technician = await fetchTechnician(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{technician.name}</h1>
        <Badge variant={getAvailabilityBadgeVariant(technician.availability)}>
          {technician.availability.replace(/_/g, ' ')}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Email</span>
            <p>{technician.email}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Phone</span>
            <p>{technician.phone}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {technician.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
            {technician.skills.length === 0 && (
              <p className="text-sm text-muted-foreground">No skills listed.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
