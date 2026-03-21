import { cn } from "../../lib/utils";

interface SelectProps {
  name?: string;
  required?: boolean;
  children: React.ReactNode;
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

export function Select({ name, required, children }: SelectProps) {
  return (
    <div className="relative" data-name={name} data-required={required}>
      {children}
      {name && <input type="hidden" name={name} />}
    </div>
  );
}

export function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <button
      type="button"
      role="combobox"
      aria-expanded="false"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-[var(--border)]",
        "bg-transparent px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectContent({ children }: SelectContentProps) {
  return (
    <div
      role="listbox"
      className="absolute z-50 mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] shadow-md"
    >
      {children}
    </div>
  );
}

export function SelectItem({ value, children }: SelectItemProps) {
  return (
    <div
      role="option"
      aria-selected="false"
      data-value={value}
      className="cursor-pointer px-3 py-2 text-sm hover:bg-[var(--muted)]"
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }: SelectValueProps) {
  return <span className="text-[var(--muted-foreground)]">{placeholder}</span>;
}
