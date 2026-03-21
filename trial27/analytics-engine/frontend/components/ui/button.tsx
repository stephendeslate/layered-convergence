// [TRACED:AE-039] shadcn/ui Button component
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
        variant === "outline" && "border border-[var(--border)] hover:bg-[var(--muted)]",
        variant === "destructive" && "bg-[var(--destructive)] text-white hover:opacity-90",
        variant === "ghost" && "hover:bg-[var(--muted)]",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-8 px-3 text-sm",
        size === "lg" && "h-12 px-6",
        className,
      )}
      {...props}
    />
  );
}
