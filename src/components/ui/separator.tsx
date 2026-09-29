import * as React from 'react';
import { cn } from '@/lib/utils';

type SeparatorProps = React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" };

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn("shrink-0 bg-black/10", orientation === "vertical" ? "h-full w-px" : "h-px w-full", className)}
      {...props}
    />
  );
}
