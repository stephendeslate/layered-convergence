import { cn } from "@/lib/utils";
import type { Technician } from "@/lib/types";

interface AvailabilityBadgeProps {
  availability: Technician["availability"];
  className?: string;
}

const badgeStyles: Record<
  Technician["availability"],
  { bg: string; text: string; dot: string; label: string }
> = {
  AVAILABLE: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
    label: "Available",
  },
  BUSY: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
    label: "Busy",
  },
  OFFLINE: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    dot: "bg-gray-400",
    label: "Offline",
  },
};

export function AvailabilityBadge({
  availability,
  className,
}: AvailabilityBadgeProps) {
  const style = badgeStyles[availability];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        style.bg,
        style.text,
        className
      )}
      data-testid="availability-badge"
    >
      <span
        className={cn("h-2 w-2 rounded-full", style.dot)}
        aria-hidden="true"
      />
      {style.label}
    </span>
  );
}
