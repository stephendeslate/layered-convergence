"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// [TRACED:UI-009] shadcn/ui Select component (replaces raw <select> per FM #71)
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  name?: string;
}

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  name?: string;
}

const SelectContext = React.createContext<SelectContextType>({
  open: false,
  setOpen: () => {},
});

function Select({ value, onValueChange, children, name }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, name }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, value, name } = React.useContext(SelectContext);
    return (
      <>
        {name && <input type="hidden" name={name} value={value ?? ""} />}
        <button
          ref={ref}
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          onClick={() => setOpen(!open)}
          {...props}
        >
          {children}
          <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
}

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = React.useContext(SelectContext);
  if (!open) return null;
  return (
    <div className={cn("absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md", className)}>
      <div className="p-1" role="listbox">{children}</div>
    </div>
  );
}

function SelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { value: selectedValue, onValueChange, setOpen } = React.useContext(SelectContext);
  return (
    <div
      role="option"
      aria-selected={selectedValue === value}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        selectedValue === value && "bg-accent",
        className
      )}
      onClick={() => {
        onValueChange?.(value);
        setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onValueChange?.(value);
          setOpen(false);
        }
      }}
      tabIndex={0}
    >
      {selectedValue === value && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </span>
      )}
      {children}
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
