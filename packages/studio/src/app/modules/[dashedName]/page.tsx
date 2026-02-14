'use client';

import { use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'urql';
import { MODULE_DETAIL_QUERY } from '@/graphql/queries';
import type { ModuleDetailResult } from '@/graphql/types';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';

const ACRONYMS = new Set(['api', 'css', 'html', 'json', 'sql']);

function formatDashedNameLabel(dashedName: string): string {
  return dashedName
    .split('-')
    .filter(Boolean)
    .map((word) =>
      ACRONYMS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
}

export default function ModuleDetailPage({
  params,
}: {
  params: Promise<{ dashedName: string }>;
}) {
  const { dashedName } = use(params);
  const searchParams = useSearchParams();
  const selectedSuperblock = searchParams.get('superblock');
  const selectedChapter = searchParams.get('chapter');

  const [result] = useQuery<ModuleDetailResult>({
    query: MODULE_DETAIL_QUERY,
    variables: {
      superblockDashedName: selectedSuperblock || undefined,
      chapterDashedName: selectedChapter || undefined,
    },
  });

  const matches = (result.data?.modules ?? []).filter(
    (module) => module.dashedName === dashedName
  );
  const moduleMatch = matches[0] ?? null;
  const totalMatches = matches.length;
  const fetching = result.fetching;
  const error = result.error;

  if (fetching) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading module...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-destructive">Error: {error.message}</p>
      </div>
    );
  }

  if (!moduleMatch) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Module not found</p>
      </div>
    );
  }

  const moduleName = formatDashedNameLabel(moduleMatch.dashedName);
  const chapterName = formatDashedNameLabel(moduleMatch.chapter.dashedName);

  return (
    <div className="p-8">
      <Breadcrumbs
        items={[
          { label: 'Curriculum', href: '/' },
          {
            label: moduleMatch.chapter.superblock.name,
            href: `/superblocks/${moduleMatch.chapter.superblock.dashedName}`,
          },
          { label: chapterName },
          { label: moduleName },
        ]}
      />

      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold">{moduleName}</h1>
        {moduleMatch.moduleType && (
          <Badge variant="outline">{moduleMatch.moduleType}</Badge>
        )}
        {moduleMatch.comingSoon && <Badge variant="warning">Coming Soon</Badge>}
      </div>

      <dl className="mt-3 flex flex-wrap gap-6 text-sm">
        <div>
          <dt className="text-muted-foreground">Dashed Name</dt>
          <dd className="font-mono">{moduleMatch.dashedName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Blocks</dt>
          <dd>{moduleMatch.blocks.length}</dd>
        </div>
        {totalMatches > 1 && (
          <div>
            <dt className="text-muted-foreground">Note</dt>
            <dd className="text-warning">
              Multiple modules share this dashed name
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 space-y-1">
        {moduleMatch.blockObjects.map((block) => (
          <Link
            key={block.dashedName}
            href={`/blocks/${block.dashedName}`}
            className="flex items-center justify-between rounded-md border border-border px-4 py-3 transition-colors hover:bg-accent"
          >
            <div>
              <span className="font-medium">{block.name}</span>
              <span className="ml-3 font-mono text-xs text-muted-foreground">
                {block.dashedName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{block.blockLayout}</Badge>
              {block.blockLabel && (
                <Badge variant="secondary">{block.blockLabel}</Badge>
              )}
              {block.isUpcomingChange && (
                <Badge variant="warning">Upcoming</Badge>
              )}
            </div>
          </Link>
        ))}

        {moduleMatch.blockObjects.length === 0 && (
          <p className="py-4 text-center text-muted-foreground">
            This module currently has no blocks
          </p>
        )}
      </div>
    </div>
  );
}
