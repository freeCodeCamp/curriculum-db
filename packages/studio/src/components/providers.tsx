'use client';

import { Provider } from 'urql';
import { client } from '@/lib/urql';

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider value={client}>{children}</Provider>;
}
