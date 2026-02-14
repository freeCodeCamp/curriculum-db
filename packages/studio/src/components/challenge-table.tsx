'use client';

import Link from 'next/link';
import type { ChallengeOrderEntry } from '@/graphql/types';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';

interface ChallengeTableProps {
  challenges: ChallengeOrderEntry[];
  onChange: (challenges: ChallengeOrderEntry[]) => void;
  titleErrors: Map<string, string>;
}

export function ChallengeTable({
  challenges,
  onChange,
  titleErrors,
}: ChallengeTableProps) {
  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...challenges];
    const item = next[index]!;
    next[index] = next[index - 1]!;
    next[index - 1] = item;
    onChange(next);
  }

  function moveDown(index: number) {
    if (index >= challenges.length - 1) return;
    const next = [...challenges];
    const item = next[index]!;
    next[index] = next[index + 1]!;
    next[index + 1] = item;
    onChange(next);
  }

  function updateTitle(index: number, title: string) {
    const next = challenges.map((c, i) => (i === index ? { ...c, title } : c));
    onChange(next);
  }

  return (
    <div className="rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2 text-left font-medium w-12">#</th>
            <th className="px-3 py-2 text-left font-medium w-72">ID</th>
            <th className="px-3 py-2 text-left font-medium">Title</th>
            <th className="px-3 py-2 text-right font-medium w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          {challenges.map((challenge, index) => {
            const error = titleErrors.get(challenge.id);
            return (
              <tr
                key={challenge.id}
                className="border-b border-border last:border-0 hover:bg-muted/30"
              >
                <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                <td className="px-3 py-2">
                  <code className="text-xs font-mono text-muted-foreground">
                    {challenge.id}
                  </code>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={challenge.title}
                    onChange={(e) => updateTitle(index, e.target.value)}
                    className={`w-full rounded border bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${error ? 'border-destructive' : 'border-border'}`}
                  />
                  {error && (
                    <p className="mt-0.5 text-xs text-destructive">{error}</p>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveDown(index)}
                      disabled={index >= challenges.length - 1}
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Link href={`/challenges/${challenge.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View challenge"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {challenges.length === 0 && (
        <p className="px-4 py-6 text-center text-muted-foreground">
          No challenges in this block
        </p>
      )}
    </div>
  );
}
