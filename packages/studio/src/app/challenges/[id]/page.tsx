'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'urql';
import { CHALLENGE_DETAIL_QUERY } from '@/graphql/queries';
import type { ChallengeDetailResult, ChallengeDetail } from '@/graphql/types';
import { useDraft } from '@/lib/use-draft';
import { validateChallengeTitle } from '@/lib/validation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DraftIndicator } from '@/components/draft-indicator';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import {
  FlashMessage,
  type FlashMessageVariant,
} from '@/components/ui/flash-message';
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
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [flashMessage, setFlashMessage] = useState<{
    text: string;
    variant: FlashMessageVariant;
  } | null>(null);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  const { fetching, error: queryError } = result;

  useEffect(
    () => () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
    },
    []
  );

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
  const challengeContent = challenge.content;

  function clearFlashMessage() {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
    setFlashMessage(null);
  }

  function showFlashMessage(
    text: string,
    variant: FlashMessageVariant = 'success'
  ) {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }

    setFlashMessage({ text, variant });
    flashTimeoutRef.current = setTimeout(() => {
      setFlashMessage(null);
      flashTimeoutRef.current = null;
    }, 2500);
  }

  function handleSave() {
    clearFlashMessage();

    if (titleErrors.length > 0) return;

    const saveResult = draft.save();
    if (saveResult === 'saved') {
      showFlashMessage('Draft saved locally.', 'success');
    } else if (saveResult === 'no_changes') {
      showFlashMessage('No active changes to save.', 'info');
    }
  }

  function handleDiscardConfirm() {
    draft.discard();
    setIsDiscardModalOpen(false);
    showFlashMessage('Draft changes discarded.', 'info');
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
          {challengeContent ? (
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-medium">Description</h3>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                  {challengeContent.description}
                </p>
              </section>

              <section>
                <h3 className="font-medium">Instructions</h3>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                  {challengeContent.instructions}
                </p>
              </section>

              <section>
                <h3 className="font-medium">Starter Files</h3>
                {challengeContent.files.length === 0 ? (
                  <p className="mt-1 text-muted-foreground">No starter files</p>
                ) : (
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    {challengeContent.files.map((file) => (
                      <li
                        key={`${file.name}.${file.ext}`}
                        className="font-mono"
                      >
                        {file.name}.{file.ext}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h3 className="font-medium">Tests</h3>
                {challengeContent.tests.length === 0 ? (
                  <p className="mt-1 text-muted-foreground">No tests</p>
                ) : (
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    {challengeContent.tests.slice(0, 10).map((test, index) => (
                      <li key={`${index}-${test.text}`}>
                        {index + 1}. {test.text}
                      </li>
                    ))}
                  </ul>
                )}
                {challengeContent.tests.length > 10 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Showing 10 of {challengeContent.tests.length} tests
                  </p>
                )}
              </section>

              <section>
                <h3 className="font-medium">Solutions</h3>
                <p className="mt-1 text-muted-foreground">
                  {challengeContent.solutions.length} solution
                  {challengeContent.solutions.length === 1 ? '' : 's'}
                </p>
              </section>
            </div>
          ) : (
            <div className="rounded-md bg-muted/50 px-4 py-8 text-center">
              <p className="text-muted-foreground">
                Content not available in MVP
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Challenge content (description, instructions, tests) will be
                available in a future version.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={handleSave} disabled={titleErrors.length > 0}>
          <Save className="h-4 w-4" />
          Save Draft
        </Button>
        <Button variant="outline" onClick={() => setIsDiscardModalOpen(true)}>
          <Undo2 className="h-4 w-4" />
          Discard Changes
        </Button>
      </div>

      <ConfirmModal
        open={isDiscardModalOpen}
        title="Discard draft changes?"
        description="This removes your local draft and restores the current server version in the editor."
        confirmLabel="Discard Changes"
        onCancel={() => setIsDiscardModalOpen(false)}
        onConfirm={handleDiscardConfirm}
      />

      <FlashMessage
        message={flashMessage?.text ?? null}
        variant={flashMessage?.variant}
      />
    </div>
  );
}
