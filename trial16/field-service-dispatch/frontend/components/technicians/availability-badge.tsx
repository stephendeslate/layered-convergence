import type { TechnicianAvailability } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const AVAILABILITY_CONFIG: Record<TechnicianAvailability, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  AVAILABLE: { label: 'Available', variant: 'success' },
  BUSY: { label: 'Busy', variant: 'warning' },
  OFF_DUTY: { label: 'Off Duty', variant: 'secondary' },
};

interface AvailabilityBadgeProps {
  availability: TechnicianAvailability;
}

export function AvailabilityBadge({ availability }: AvailabilityBadgeProps) {
  const config = AVAILABILITY_CONFIG[availability];

  return (
    <Badge variant={config.variant} aria-label={`Availability: ${config.label}`}>
      {config.label}
    </Badge>
  );
}
