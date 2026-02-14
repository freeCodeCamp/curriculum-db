'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from 'urql';
import { SUPERBLOCKS_QUERY } from '@/graphql/queries';
import type { SuperblockListResult } from '@/graphql/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BookOpen, FileText, Search } from 'lucide-react';

export function Sidebar() {
  const [search, setSearch] = useState('');
  const [result] = useQuery<SuperblockListResult>({
    query: SUPERBLOCKS_QUERY,
  });
  const pathname = usePathname();

  const superblocks = result.data?.superblocks ?? [];
  const filtered = superblocks.filter((sb) =>
    sb.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-border bg-background">
      <div className="border-b border-border p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5" />
          Curriculum Studio
        </Link>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search superblocks..."
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {result.fetching && (
          <p className="px-3 py-2 text-sm text-muted-foreground">Loading...</p>
        )}
        {result.error && (
          <p className="px-3 py-2 text-sm text-destructive">
            Failed to load superblocks
          </p>
        )}
        {filtered.map((sb) => (
          <Link
            key={sb.dashedName}
            href={`/superblocks/${sb.dashedName}`}
            className={cn(
              'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
              pathname === `/superblocks/${sb.dashedName}` && 'bg-accent'
            )}
          >
            <span className="truncate">{sb.name}</span>
            {sb.isCertification && (
              <Badge variant="secondary" className="ml-2 shrink-0">
                Cert
              </Badge>
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <Link
          href="/drafts"
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
            pathname === '/drafts' && 'bg-accent'
          )}
        >
          <FileText className="h-4 w-4" />
          Draft Changes
        </Link>
      </div>
    </aside>
  );
}
