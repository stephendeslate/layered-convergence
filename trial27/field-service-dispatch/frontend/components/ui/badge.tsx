import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" &&
          "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]",
        variant === "secondary" &&
          "border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)]",
        variant === "destructive" &&
          "border-transparent bg-[var(--destructive)] text-[var(--destructive-foreground)]",
        variant === "outline" && "text-[var(--foreground)]",
        variant === "success" &&
          "border-transparent bg-[var(--success)] text-white",
        variant === "warning" &&
          "border-transparent bg-[var(--warning)] text-white",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
