import * as React from 'react';
import { cn } from '@/lib/utils';

export function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return <input type="checkbox" className={cn("h-4 w-4 rounded border-black/25 text-[#f5b44b] focus:ring-2 focus:ring-[#f5b44b]/40", className)} {...props} />;
}
