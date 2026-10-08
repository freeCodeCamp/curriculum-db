'use client';

import Link from 'next/link';
import { useQuery } from 'urql';
import { CURRICULUM_OVERVIEW_QUERY } from '@/graphql/queries';
import type { CurriculumOverviewResult } from '@/graphql/types';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Award, Layers } from 'lucide-react';

export default function CurriculumOverview() {
  const [result] = useQuery<CurriculumOverviewResult>({
    query: CURRICULUM_OVERVIEW_QUERY,
  });

  const { data, fetching, error } = result;

  if (fetching) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading curriculum data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-destructive">Error: {error.message}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Make sure the GraphQL server is running at the configured endpoint.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const totalBlocks = data.superblocks.reduce(
    (sum, sb) => sum + sb.blocks.length,
    0
  );

  return (
    <div className="p-8">
      <Breadcrumbs items={[{ label: 'Curriculum' }]} />

      <h1 className="mt-4 text-2xl font-bold">Curriculum Overview</h1>
      <p className="mt-1 text-muted-foreground">
        Browse and edit freeCodeCamp curriculum metadata
      </p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{data.superblocks.length}</p>
              <p className="text-sm text-muted-foreground">Superblocks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <Award className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{data.certifications.length}</p>
              <p className="text-sm text-muted-foreground">Certifications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <Layers className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{totalBlocks}</p>
              <p className="text-sm text-muted-foreground">Total Blocks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Superblocks</h2>
      <div className="mt-3 space-y-1">
        {data.superblocks.map((sb) => (
          <Link
            key={sb.dashedName}
            href={`/superblocks/${sb.dashedName}`}
            className="flex items-center justify-between rounded-md border border-border px-4 py-3 transition-colors hover:bg-accent"
          >
            <div>
              <span className="font-medium">{sb.name}</span>
              <span className="ml-3 text-sm text-muted-foreground">
                {sb.blocks.length} block{sb.blocks.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {sb.isCertification && (
                <Badge variant="secondary">Certification</Badge>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
