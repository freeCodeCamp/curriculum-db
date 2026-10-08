'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  listAllDrafts,
  discardDraftRecord,
  type DraftEntry,
} from '@/lib/drafts';
import { formatDate } from '@/lib/utils';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ExternalLink, FileText } from 'lucide-react';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);

  useEffect(() => {
    setDrafts(listAllDrafts());
  }, []);

  function removeDraft(entry: DraftEntry) {
    discardDraftRecord(entry.type, entry.id);
    setDrafts(listAllDrafts());
  }

  function getLink(entry: DraftEntry): string {
    if (entry.type === 'block') return `/blocks/${entry.id}`;
    return `/challenges/${entry.id}`;
  }

  return (
    <div className="p-8 max-w-3xl">
      <Breadcrumbs
        items={[{ label: 'Curriculum', href: '/' }, { label: 'Drafts' }]}
      />

      <h1 className="mt-4 text-2xl font-bold">Draft Changes</h1>
      <p className="mt-1 text-muted-foreground">
        All locally saved drafts. These are stored in your browser and not
        persisted to the server.
      </p>

      {drafts.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="py-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No drafts yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Edit a block or challenge and save a draft to see it here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-2">
          {drafts.map((entry) => (
            <div
              key={`${entry.type}:${entry.id}`}
              className="flex items-center justify-between rounded-md border border-border px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Badge variant="draft">{entry.type}</Badge>
                <div>
                  <p className="font-mono text-sm">{entry.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.record.patch.length} change
                    {entry.record.patch.length !== 1 ? 's' : ''} --{' '}
                    {formatDate(entry.record.updatedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={getLink(entry)}>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDraft(entry)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
