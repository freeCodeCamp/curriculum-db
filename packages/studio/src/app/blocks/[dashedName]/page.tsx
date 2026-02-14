'use client';

import { useState, useRef, use } from 'react';
import Link from 'next/link';
import { useQuery } from 'urql';
import { BLOCK_DETAIL_QUERY } from '@/graphql/queries';
import type { BlockDetailResult, BlockDetail } from '@/graphql/types';
import { BLOCK_LAYOUTS, BLOCK_LABELS } from '@/graphql/types';
import { useDraft } from '@/lib/use-draft';
import { validateBlock, type ValidationError } from '@/lib/validation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DraftIndicator } from '@/components/draft-indicator';
import { DiffViewer } from '@/components/diff-viewer';
import { ChallengeTable } from '@/components/challenge-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Eye, Save, Undo2 } from 'lucide-react';

export default function BlockDetailPage({
  params,
}: {
  params: Promise<{ dashedName: string }>;
}) {
  const { dashedName } = use(params);
  const [result] = useQuery<BlockDetailResult>({
    query: BLOCK_DETAIL_QUERY,
    variables: { dashedName },
  });

  const original = result.data?.block ?? undefined;
  const draft = useDraft<BlockDetail>('block', dashedName, original);

  const [showDiff, setShowDiff] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, fetching, error: queryError } = result;

  if (fetching) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading block...</p>
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

  if (!data?.block || !draft.edited) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Block not found</p>
      </div>
    );
  }

  const block = draft.edited;
  const parentSuperblock = block.superblocks[0];

  function getFieldError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  function handleSave() {
    const validationErrors = validateBlock(block);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;
    draft.save();
  }

  function handleExport() {
    const json = draft.getExportData();
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patch-block-${dashedName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      draft.importPatchData(reader.result as string);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const titleErrors = new Map<string, string>();
  for (const err of errors) {
    if (err.field.startsWith('challenge:')) {
      titleErrors.set(err.field.replace('challenge:', ''), err.message);
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <Breadcrumbs
        items={[
          { label: 'Curriculum', href: '/' },
          ...(parentSuperblock
            ? [
                {
                  label: parentSuperblock.name,
                  href: `/superblocks/${parentSuperblock.dashedName}`,
                },
              ]
            : []),
          { label: block.name },
        ]}
      />

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{block.name}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {block.dashedName}
          </p>
        </div>
        <DraftIndicator
          hasSavedDraft={draft.hasSavedDraft}
          hasUnsavedChanges={draft.hasUnsavedChanges}
          isDraftOutdated={draft.isDraftOutdated}
        />
      </div>

      {block.superblocks.length > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Shared across:</span>
          {block.superblocks.map((sb) => (
            <Link key={sb.dashedName} href={`/superblocks/${sb.dashedName}`}>
              <Badge variant="outline">{sb.name}</Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Block Metadata */}
      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold">Block Metadata</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Help Category"
              id="helpCategory"
              value={block.helpCategory}
              onChange={(e) =>
                draft.updateEdited((prev) => ({
                  ...prev,
                  helpCategory: e.target.value,
                }))
              }
              error={getFieldError('helpCategory')}
            />

            <Select
              label="Block Layout"
              id="blockLayout"
              value={block.blockLayout}
              onChange={(e) =>
                draft.updateEdited((prev) => ({
                  ...prev,
                  blockLayout: e.target.value as BlockDetail['blockLayout'],
                }))
              }
              options={BLOCK_LAYOUTS.map((v) => ({ value: v, label: v }))}
            />

            <Select
              label="Block Label"
              id="blockLabel"
              value={block.blockLabel ?? ''}
              onChange={(e) =>
                draft.updateEdited((prev) => ({
                  ...prev,
                  blockLabel:
                    (e.target.value as BlockDetail['blockLabel']) || null,
                }))
              }
              options={[
                { value: '', label: 'None' },
                ...BLOCK_LABELS.map((v) => ({ value: v, label: v })),
              ]}
            />

            <div className="space-y-3 pt-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={block.isUpcomingChange}
                  onChange={(e) =>
                    draft.updateEdited((prev) => ({
                      ...prev,
                      isUpcomingChange: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                Is Upcoming Change
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={block.usesMultifileEditor ?? false}
                  onChange={(e) =>
                    draft.updateEdited((prev) => ({
                      ...prev,
                      usesMultifileEditor: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                Uses Multifile Editor
                {block.usesMultifileEditor === null && (
                  <span className="text-xs text-muted-foreground">(unset)</span>
                )}
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={block.hasEditableBoundaries ?? false}
                  onChange={(e) =>
                    draft.updateEdited((prev) => ({
                      ...prev,
                      hasEditableBoundaries: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                Has Editable Boundaries
                {block.hasEditableBoundaries === null && (
                  <span className="text-xs text-muted-foreground">(unset)</span>
                )}
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenge Order */}
      <div className="mt-6">
        <h2 className="mb-3 font-semibold">
          Challenge Order ({block.challengeOrder.length})
        </h2>
        {getFieldError('challengeOrder') && (
          <p className="mb-2 text-sm text-destructive">
            {getFieldError('challengeOrder')}
          </p>
        )}
        <ChallengeTable
          challenges={block.challengeOrder}
          onChange={(challengeOrder) =>
            draft.updateEdited((prev) => ({ ...prev, challengeOrder }))
          }
          titleErrors={titleErrors}
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Draft
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            draft.discard();
            setErrors([]);
          }}
        >
          <Undo2 className="h-4 w-4" />
          Discard Changes
        </Button>
        <Button variant="outline" onClick={() => setShowDiff(!showDiff)}>
          <Eye className="h-4 w-4" />
          {showDiff ? 'Hide Diff' : 'View Diff'}
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export Patch
        </Button>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Import Patch
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {errors.length > 0 && (
        <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 p-3">
          <p className="text-sm font-medium text-destructive">
            Cannot save draft. Fix the following errors:
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-destructive">
            {errors.map((e, i) => (
              <li key={i}>{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Diff Viewer */}
      {showDiff && (
        <div className="mt-6">
          <DiffViewer
            patch={draft.currentPatch}
            onClose={() => setShowDiff(false)}
          />
        </div>
      )}
    </div>
  );
}
