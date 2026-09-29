import * as React from 'react';
import { cn } from '@/lib/utils';

export function Avatar({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}

export function AvatarImage({ className, alt = "", onError, ...props }: React.ComponentProps<"img">) {
  const [failed, setFailed] = React.useState(false);
  if (failed) return null;
  return <img alt={alt} className={cn("aspect-square h-full w-full object-cover", className)} onError={(event) => { setFailed(true); onError?.(event); }} {...props} />;
}

export function AvatarFallback({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-900", className)} {...props} />;
}
