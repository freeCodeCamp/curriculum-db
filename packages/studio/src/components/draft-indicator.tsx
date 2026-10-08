import { Badge } from '@/components/ui/badge';

interface DraftIndicatorProps {
  hasSavedDraft: boolean;
  hasUnsavedChanges: boolean;
  isDraftOutdated: boolean;
}

export function DraftIndicator({
  hasSavedDraft,
  hasUnsavedChanges,
  isDraftOutdated,
}: DraftIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {hasSavedDraft && <Badge variant="draft">Draft changes</Badge>}
      {hasUnsavedChanges && <Badge variant="warning">Unsaved changes</Badge>}
      {isDraftOutdated && (
        <Badge variant="destructive">Draft may be out of date</Badge>
      )}
    </div>
  );
}
