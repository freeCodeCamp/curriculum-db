import type { ChallengeOrderEntry } from '@/graphql/types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateBlock(block: {
  helpCategory: string;
  challengeOrder: ChallengeOrderEntry[];
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!block.helpCategory.trim()) {
    errors.push({
      field: 'helpCategory',
      message: 'Help category is required',
    });
  }

  const ids = block.challengeOrder.map((c) => c.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    errors.push({
      field: 'challengeOrder',
      message: 'Duplicate challenge IDs detected',
    });
  }

  for (const challenge of block.challengeOrder) {
    if (!challenge.title.trim()) {
      errors.push({
        field: `challenge:${challenge.id}`,
        message: `Title is required for challenge ${challenge.id}`,
      });
    }
  }

  return errors;
}

export function validateChallengeTitle(title: string): ValidationError[] {
  if (!title.trim()) {
    return [{ field: 'title', message: 'Challenge title is required' }];
  }
  return [];
}
