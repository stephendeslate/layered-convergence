import * as React from "react";
import { cn } from "../../lib/utils";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType>({
  open: false,
  setOpen: () => {},
});

function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext);
  return (
    <button
      ref={ref}
      type="button"
      role="combobox"
      aria-expanded={open}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] ring-offset-[var(--background)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <span aria-hidden="true">&#x25BE;</span>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
}

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = React.useContext(SelectContext);
  if (!open) return null;
  return (
    <div
      ref={ref}
      role="listbox"
      className={cn(
        "absolute z-50 mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] py-1 shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

function SelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: selectedValue, onValueChange, setOpen } =
    React.useContext(SelectContext);
  return (
    <div
      role="option"
      aria-selected={selectedValue === value}
      className={cn(
        "cursor-pointer px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)]",
        selectedValue === value && "bg-[var(--accent)]",
        className,
      )}
      onClick={() => {
        onValueChange?.(value);
        setOpen(false);
      }}
    >
      {children}
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
