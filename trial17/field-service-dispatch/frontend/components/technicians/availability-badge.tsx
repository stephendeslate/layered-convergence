import { Badge } from '@/components/ui/badge';
import { availabilityLabel } from '@/lib/utils';
import type { TechnicianAvailability } from '@/lib/types';

function availabilityVariant(availability: TechnicianAvailability) {
  const map: Record<TechnicianAvailability, 'success' | 'warning' | 'secondary' | 'destructive'> = {
    AVAILABLE: 'success',
    BUSY: 'warning',
    OFF_DUTY: 'secondary',
    ON_LEAVE: 'destructive',
  };
  return map[availability];
}

interface AvailabilityBadgeProps {
  availability: TechnicianAvailability;
}

export function AvailabilityBadge({ availability }: AvailabilityBadgeProps) {
  return (
    <Badge
      variant={availabilityVariant(availability)}
      aria-label={`Availability: ${availabilityLabel(availability)}`}
    >
      {availabilityLabel(availability)}
    </Badge>
  );
}
