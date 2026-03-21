import { cn } from "@/lib/utils";
import type { Technician } from "@/lib/types";

interface AvailabilityIndicatorProps {
  availability: Technician["availability"];
  className?: string;
}

const availabilityConfig: Record<
  Technician["availability"],
  { color: string; label: string }
> = {
  AVAILABLE: { color: "bg-green-500", label: "Available" },
  BUSY: { color: "bg-yellow-500", label: "Busy" },
  OFFLINE: { color: "bg-gray-400", label: "Offline" },
};

export function AvailabilityIndicator({
  availability,
  className,
}: AvailabilityIndicatorProps) {
  const config = availabilityConfig[availability];

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      data-testid="availability-indicator"
    >
      <span
        className={cn("h-2.5 w-2.5 rounded-full", config.color)}
        aria-hidden="true"
      />
      <span className="text-sm text-muted-foreground">{config.label}</span>
    </div>
  );
}
