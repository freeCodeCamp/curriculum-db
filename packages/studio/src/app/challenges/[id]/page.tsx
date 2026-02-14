'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from 'urql';
import { CHALLENGE_DETAIL_QUERY } from '@/graphql/queries';
import type { ChallengeDetailResult, ChallengeDetail } from '@/graphql/types';
import { useDraft } from '@/lib/use-draft';
import { validateChallengeTitle } from '@/lib/validation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DraftIndicator } from '@/components/draft-indicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Save, Undo2 } from 'lucide-react';

export default function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [result] = useQuery<ChallengeDetailResult>({
    query: CHALLENGE_DETAIL_QUERY,
    variables: { id },
  });

  const original = result.data?.challenge ?? undefined;
  const draft = useDraft<ChallengeDetail>('challenge', id, original);

  const { fetching, error: queryError } = result;

  if (fetching) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading challenge...</p>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="p-8">
        <p className="text-destructive">Error: {queryError.message}</p>
      </div>
    );
  }

  if (!original || !draft.edited) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Challenge not found</p>
      </div>
    );
  }

  const challenge = draft.edited;
  const titleErrors = validateChallengeTitle(challenge.title);

  function handleSave() {
    if (titleErrors.length > 0) return;
    draft.save();
  }

  return (
    <div className="p-8 max-w-3xl">
      <Breadcrumbs
        items={[
          { label: 'Curriculum', href: '/' },
          {
            label: challenge.block.name,
            href: `/blocks/${challenge.block.dashedName}`,
          },
          { label: challenge.title },
        ]}
      />

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{challenge.title}</h1>
        <DraftIndicator
          hasSavedDraft={draft.hasSavedDraft}
          hasUnsavedChanges={draft.hasUnsavedChanges}
          isDraftOutdated={draft.isDraftOutdated}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold">Challenge Metadata</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">ID</label>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {challenge.id}
            </p>
          </div>

          <Input
            label="Title"
            id="title"
            value={challenge.title}
            onChange={(e) =>
              draft.updateEdited((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            error={titleErrors[0]?.message}
          />

          <div>
            <label className="text-sm font-medium text-foreground">Block</label>
            <p className="mt-1">
              <Link
                href={`/blocks/${challenge.block.dashedName}`}
                className="text-sm text-draft hover:underline"
              >
                {challenge.block.name}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <h2 className="font-semibold">Content</h2>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted/50 px-4 py-8 text-center">
            <p className="text-muted-foreground">
              Content not available in MVP
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Challenge content (description, instructions, tests) will be
              available in a future version.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={handleSave} disabled={titleErrors.length > 0}>
          <Save className="h-4 w-4" />
          Save Draft
        </Button>
        <Button variant="outline" onClick={draft.discard}>
          <Undo2 className="h-4 w-4" />
          Discard Changes
        </Button>
      </div>
    </div>
  );
}
