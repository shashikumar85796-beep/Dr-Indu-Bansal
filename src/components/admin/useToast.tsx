'use client';

import { useCallback, useEffect, useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState<{ text: string; err?: boolean } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  const show = useCallback((text: string, err?: boolean) => setToast({ text, err }), []);
  const node = toast ? (
    <div className={`toast${toast.err ? ' err' : ''}`} role="status">
      {toast.text}
    </div>
  ) : null;
  return [show, node] as const;
}
