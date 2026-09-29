import * as React from 'react';
import { cn } from '@/lib/utils';

type SafeImageProps = React.ComponentProps<"img"> & {
  fallback?: React.ReactNode;
  /** next/image-compatible convenience: cover the positioned parent. */
  fill?: boolean;
};

export function SafeImage({ className, fallback, fill = false, style, alt = "", onError, ...props }: SafeImageProps) {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    if (fallback !== undefined) return <>{fallback}</>;
    return <div aria-hidden className={cn("h-full w-full bg-gradient-to-br from-black/10 to-black/5", className)} />;
  }
  return (
    <img
      alt={alt}
      className={className}
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style } : style}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      {...props}
    />
  );
}
