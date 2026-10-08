import { describe, expect, it } from 'vitest';
import { normalizeBlock } from '../data/normalizer.js';
import type { RawBlock } from '../data/types.js';

const block: RawBlock = {
  dashedName: 'learn-html-by-building-a-cat-photo-app',
  helpCategory: 'HTML-CSS',
  challengeOrder: [],
  blockLayout: 'legacy-challenge-grid',
  isUpcomingChange: false,
};

describe('normalizeBlock()', () => {
  it('generates a name from the dashed name when the raw block has none', () => {
    const result = normalizeBlock(block.dashedName, block, [
      'responsive-web-design',
    ]);

    expect(result.name).toBe('Learn Html By Building A Cat Photo App');
  });

  it('preserves a name provided by the raw block', () => {
    const result = normalizeBlock(
      block.dashedName,
      { ...block, name: 'Build a Cat Photo App' },
      ['responsive-web-design']
    );

    expect(result.name).toBe('Build a Cat Photo App');
  });
});
