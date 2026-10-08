'use client';

import type { Operation } from 'fast-json-patch';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DiffViewerProps {
  patch: Operation[];
  onClose: () => void;
}

function opColor(op: string): string {
  switch (op) {
    case 'add':
      return 'bg-success/10 text-success';
    case 'remove':
      return 'bg-destructive/10 text-destructive';
    case 'replace':
      return 'bg-warning/10 text-warning';
    case 'move':
      return 'bg-draft/10 text-draft';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function formatValue(value: unknown): string {
  if (value === undefined) return '';
  if (typeof value === 'string') return `"${value}"`;
  return JSON.stringify(value);
}

export function DiffViewer({ patch, onClose }: DiffViewerProps) {
  if (patch.length === 0) {
    return (
      <div className="rounded-lg border border-border p-6 text-center">
        <p className="text-muted-foreground">No changes detected</p>
        <Button variant="outline" size="sm" onClick={onClose} className="mt-3">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-medium">
          Changes ({patch.length} operation{patch.length !== 1 ? 's' : ''})
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="divide-y divide-border">
        {patch.map((op, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3 text-sm">
            <span
              className={cn(
                'rounded px-2 py-0.5 text-xs font-mono font-medium',
                opColor(op.op)
              )}
            >
              {op.op}
            </span>
            <code className="font-mono text-muted-foreground">{op.path}</code>
            {'value' in op && (
              <span className="ml-auto truncate font-mono text-xs max-w-xs">
                {formatValue(op.value)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
