'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useQuery } from 'urql';
import { SUPERBLOCK_DETAIL_QUERY } from '@/graphql/queries';
import type { SuperblockDetailResult } from '@/graphql/types';
import { BLOCK_LAYOUTS, BLOCK_LABELS } from '@/graphql/types';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';

export default function SuperblockDetailPage({
  params,
}: {
  params: Promise<{ dashedName: string }>;
}) {
  const { dashedName } = use(params);
  const [result] = useQuery<SuperblockDetailResult>({
    query: SUPERBLOCK_DETAIL_QUERY,
    variables: { dashedName },
  });

  const [layoutFilter, setLayoutFilter] = useState<string>('');
  const [labelFilter, setLabelFilter] = useState<string>('');
  const [upcomingFilter, setUpcomingFilter] = useState<string>('');

  const { data, fetching, error } = result;

  if (fetching) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading superblock...</p>
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

  const superblock = data?.superblock;
  if (!superblock) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Superblock not found</p>
      </div>
    );
  }

  let blocks = superblock.blockObjects;
  if (layoutFilter) {
    blocks = blocks.filter((b) => b.blockLayout === layoutFilter);
  }
  if (labelFilter) {
    blocks = blocks.filter((b) => b.blockLabel === labelFilter);
  }
  if (upcomingFilter === 'true') {
    blocks = blocks.filter((b) => b.isUpcomingChange);
  } else if (upcomingFilter === 'false') {
    blocks = blocks.filter((b) => !b.isUpcomingChange);
  }

  return (
    <div className="p-8">
      <Breadcrumbs
        items={[{ label: 'Curriculum', href: '/' }, { label: superblock.name }]}
      />

      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold">{superblock.name}</h1>
        {superblock.isCertification && (
          <Badge variant="secondary">Certification</Badge>
        )}
      </div>

      <dl className="mt-3 flex gap-6 text-sm">
        <div>
          <dt className="text-muted-foreground">Dashed Name</dt>
          <dd className="font-mono">{superblock.dashedName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Blocks</dt>
          <dd>{superblock.blockObjects.length}</dd>
        </div>
      </dl>

      <div className="mt-6 flex items-end gap-3">
        <Select
          label="Block Layout"
          id="layout-filter"
          value={layoutFilter}
          onChange={(e) => setLayoutFilter(e.target.value)}
          options={[
            { value: '', label: 'All layouts' },
            ...BLOCK_LAYOUTS.map((v) => ({ value: v, label: v })),
          ]}
        />
        <Select
          label="Block Label"
          id="label-filter"
          value={labelFilter}
          onChange={(e) => setLabelFilter(e.target.value)}
          options={[
            { value: '', label: 'All labels' },
            ...BLOCK_LABELS.map((v) => ({ value: v, label: v })),
          ]}
        />
        <Select
          label="Upcoming Change"
          id="upcoming-filter"
          value={upcomingFilter}
          onChange={(e) => setUpcomingFilter(e.target.value)}
          options={[
            { value: '', label: 'All' },
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ]}
        />
      </div>

      <div className="mt-4 space-y-1">
        {blocks.map((block) => (
          <Link
            key={block.dashedName}
            href={`/blocks/${block.dashedName}`}
            className="flex items-center justify-between rounded-md border border-border px-4 py-3 transition-colors hover:bg-accent"
          >
            <div>
              <span className="font-medium">{block.name}</span>
              <span className="ml-3 text-xs text-muted-foreground font-mono">
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
        {blocks.length === 0 && (
          <p className="py-4 text-center text-muted-foreground">
            No blocks match the current filters
          </p>
        )}
      </div>
    </div>
  );
}
