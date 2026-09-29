import * as React from 'react';
import { cn } from '@/lib/utils';

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

type TabsProps = React.ComponentProps<"div"> & {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

export function Tabs({ className, defaultValue, value, onValueChange, ...props }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;
  const setValue = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) setInternalValue(nextValue);
      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue }}>
      <div className={cn("flex flex-col gap-2", className)} {...props} />
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="tablist" className={cn("inline-flex items-center justify-center rounded-md bg-slate-100 p-1", className)} {...props} />;
}

type TabsTriggerProps = Omit<React.ComponentProps<"button">, "value"> & { value: string };

export function TabsTrigger({ className, value, onClick, ...props }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  const active = context?.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      className={cn("inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50", className)}
      onClick={(event) => {
        context?.setValue(value);
        onClick?.(event);
      }}
      {...props}
    />
  );
}

type TabsContentProps = React.ComponentProps<"div"> & { value: string };

export function TabsContent({ className, value, ...props }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  const active = context?.value === value;
  if (!active) return null;
  return <div role="tabpanel" data-state="active" className={cn("outline-none", className)} {...props} />;
}
