import { cn } from "../../lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" && "bg-[var(--primary)] text-[var(--primary-foreground)]",
        variant === "secondary" && "bg-[var(--muted)] text-[var(--muted-foreground)]",
        variant === "destructive" && "bg-[var(--destructive)] text-white",
        variant === "outline" && "border border-[var(--border)]",
        className,
      )}
      {...props}
    />
  );
}
