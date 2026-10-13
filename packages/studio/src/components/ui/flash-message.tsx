import { CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FlashMessageVariant = 'success' | 'info';

interface FlashMessageProps {
  message: string | null;
  variant?: FlashMessageVariant;
}

export function FlashMessage({
  message,
  variant = 'success',
}: FlashMessageProps) {
  if (!message) return null;

  const classes =
    variant === 'success'
      ? 'border-success/25 bg-success/10 text-success'
      : 'border-draft/25 bg-draft/10 text-draft';

  return (
    <div
      className={cn(
        'fixed right-6 top-6 z-50 flex max-w-sm items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-lg',
        classes
      )}
      role="status"
      aria-live="polite"
    >
      {variant === 'success' ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <Info className="h-4 w-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}
