import * as React from 'react';
import { cn } from '@/lib/utils';

export function Alert({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('rounded-md border border-black/10 bg-white/70 px-4 py-3 text-sm', className)} {...props} />;
}
