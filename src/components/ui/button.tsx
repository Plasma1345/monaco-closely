import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ComponentProps<"button"> & {
  size?: "default" | "sm" | "md" | "lg" | "icon";
  variant?: "default" | "primary" | "destructive" | "outline" | "secondary" | "ghost" | "link";
};

export function Button({ className, size = "default", variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#f5b44b]/50 disabled:pointer-events-none disabled:opacity-50",
        (size === "default" || size === "md") && "h-10 px-4 text-sm",
        size === "sm" && "h-8 px-3 text-xs",
        size === "lg" && "h-12 px-5 text-base",
        size === "icon" && "h-10 w-10 p-0",
        (variant === "default" || variant === "primary") && "border-[#f5b44b]/50 bg-[#f5b44b] text-black hover:bg-[#f7c36b]",
        variant === "destructive" && "border-red-700 bg-red-700 text-white hover:bg-red-800",
        variant === "outline" && "border-current bg-transparent hover:bg-black/5",
        variant === "secondary" && "border-black/10 bg-white/60 text-slate-900 hover:bg-white",
        variant === "ghost" && "border-transparent bg-transparent hover:bg-black/5",
        variant === "link" && "h-auto border-transparent bg-transparent p-0 underline-offset-4 hover:underline",
        className,
      )}
      {...props}
    />
  );
}
