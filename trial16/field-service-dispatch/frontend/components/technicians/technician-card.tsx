import Link from 'next/link';
import type { Technician } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AvailabilityBadge } from './availability-badge';

interface TechnicianCardProps {
  technician: Technician;
}

export function TechnicianCard({ technician }: TechnicianCardProps) {
  return (
    <Link href={`/technicians/${technician.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base">{technician.name}</CardTitle>
            <AvailabilityBadge availability={technician.availability} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{technician.email}</p>
          <p className="text-sm text-muted-foreground">{technician.phone}</p>
          {technician.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {technician.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-muted rounded-full px-2 py-0.5"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
