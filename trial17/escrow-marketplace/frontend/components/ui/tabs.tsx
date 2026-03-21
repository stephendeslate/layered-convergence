'use client';

import { cn } from '@/lib/utils';
import { type HTMLAttributes, type ButtonHTMLAttributes, createContext, useContext, useState } from 'react';

const TabsContext = createContext<{
  value: string;
  onChange: (value: string) => void;
}>({ value: '', onChange: () => {} });

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  onValueChange?: (value: string) => void;
}

function Tabs({ defaultValue, onValueChange, children, className, ...props }: TabsProps) {
  const [value, setValue] = useState(defaultValue);
  const handleChange = (v: string) => {
    setValue(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      <div className={cn('', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex h-10 items-center gap-1 rounded-md bg-gray-100 p-1', className)}
      {...props}
    />
  );
}

interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  const isActive = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.onChange(value)}
      className={cn(
        'inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all',
        isActive ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700',
        className,
      )}
      {...props}
    />
  );
}

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({ value, className, ...props }: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return (
    <div role="tabpanel" className={cn('mt-2', className)} {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
