import { useCallback, useState } from 'react';

export type ToastItem = { id: string; title: string; description?: string };

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    setToasts((current) => [...current, { ...item, id: crypto.randomUUID() }]);
  }, []);
  return { toasts, toast };
}
