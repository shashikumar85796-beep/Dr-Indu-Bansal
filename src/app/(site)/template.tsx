import type { ReactNode } from 'react';

// Re-mounts on each navigation so every page fades in.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="pt">{children}</div>;
}
