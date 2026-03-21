interface AvailabilityBadgeProps {
  available: boolean;
}

export function AvailabilityBadge({ available }: AvailabilityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {available ? 'Available' : 'Unavailable'}
    </span>
  );
}
