import * as React from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={cn('flex h-10 w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#f5b44b]/40 disabled:opacity-50', className)} {...props} />;
}
