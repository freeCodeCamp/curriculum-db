import { describe, it, expect } from 'vitest';
import {
  validateCurriculumReferences,
  validateSuperblockReferences,
  validateBlockEnums,
  validateChallengeStructure,
} from '../data/validators.js';
import type {
  RawSuperblock,
  RawBlock,
  RawChallenge,
  RawBlockType,
} from '../data/types.js';

describe('Data Validators', () => {
  describe('validateCurriculumReferences()', () => {
    it('should always succeed (intentionally permissive)', () => {
      const result = validateCurriculumReferences();
      expect(result.success).toBe(true);
    });
  });

  describe('validateSuperblockReferences()', () => {
    it('should succeed when all block references exist', () => {
      const superblocks = new Map<string, RawSuperblock>([
        [
          'test-superblock',
          {
            blocks: ['block-1', 'block-2'],
          },
        ],
      ]);

      const blocks = new Map<string, RawBlock>([
        [
          'block-1',
          {
            name: 'Block 1',
            dashedName: 'block-1',
            helpCategory: 'test',
            challengeOrder: [{ id: 'c1', title: 'Challenge 1' }],
            blockLayout: 'challenge-list',
            isUpcomingChange: false,
          },
        ],
        [
          'block-2',
          {
            name: 'Block 2',
            dashedName: 'block-2',
            helpCategory: 'test',
            challengeOrder: [{ id: 'c2', title: 'Challenge 2' }],
            blockLayout: 'challenge-grid',
            isUpcomingChange: false,
          },
        ],
      ]);

      const result = validateSuperblockReferences(superblocks, blocks);
      expect(result.success).toBe(true);
    });

    it('should fail when block reference is missing', () => {
      const superblocks = new Map<string, RawSuperblock>([
        [
          'test-superblock',
          {
            blocks: ['block-1', 'missing-block'],
          },
        ],
      ]);

      const blocks = new Map<string, RawBlock>([
        [
          'block-1',
          {
            name: 'Block 1',
            dashedName: 'block-1',
            helpCategory: 'test',
            challengeOrder: [{ id: 'c1', title: 'Challenge 1' }],
            blockLayout: 'challenge-list',
            isUpcomingChange: false,
          },
        ],
      ]);

      const result = validateSuperblockReferences(superblocks, blocks);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.message).toContain('missing-block');
        expect(result.error.message).toContain('test-superblock');
        expect(result.error.filePath).toContain('test-superblock.json');
        expect(result.error.field).toBe('blocks');
      }
    });

    it('should validate multiple superblocks', () => {
      const superblocks = new Map<string, RawSuperblock>([
        [
          'superblock-1',
          {
            blocks: ['block-1'],
          },
        ],
        [
          'superblock-2',
          {
            blocks: ['block-2', 'missing-block'],
          },
        ],
      ]);

      const blocks = new Map<string, RawBlock>([
        [
          'block-1',
          {
            name: 'Block 1',
            dashedName: 'block-1',
            helpCategory: 'test',
            challengeOrder: [{ id: 'c1', title: 'Challenge 1' }],
            blockLayout: 'challenge-list',
            isUpcomingChange: false,
          },
        ],
        [
          'block-2',
          {
            name: 'Block 2',
            dashedName: 'block-2',
            helpCategory: 'test',
            challengeOrder: [{ id: 'c2', title: 'Challenge 2' }],
            blockLayout: 'challenge-grid',
            isUpcomingChange: false,
          },
        ],
      ]);

      const result = validateSuperblockReferences(superblocks, blocks);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.message).toContain('missing-block');
        expect(result.error.message).toContain('superblock-2');
      }
    });
  });

  describe('validateBlockEnums()', () => {
    it('should succeed for valid blockLayout values', () => {
      const validLayouts = [
        'link',
        'challenge-list',
        'challenge-grid',
        'dialogue-grid',
        'project-list',
        'legacy-challenge-list',
        'legacy-challenge-grid',
        'legacy-link',
      ];

      for (const layout of validLayouts) {
        const block: RawBlock = {
          name: 'Test Block',
          dashedName: 'test-block',
          helpCategory: 'test',
          challengeOrder: [{ id: 'c1', title: 'Challenge 1' }],
          blockLayout: layout as RawBlock['blockLayout'],
          isUpcomingChange: false,
        };

        const result = validateBlockEnums(block, 'test-path.json');
        expect(result.success).toBe(true);
      }
    });

    it('should fail for invalid blockLayout', () => {
      const block = {
        dashedName: 'test-block',
        challengeOrder: [{ id: 'c1', title: 'Challenge 1' }],
        blockLayout: 'invalid-layout',
      } as unknown as RawBlock;

      const result = validateBlockEnums(block, 'test-block.json');
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.message).toContain('invalid-layout');
        expect(result.error.message).toContain('blockLayout');
        expect(result.error.filePath).toBe('test-block.json');
        expect(result.error.field).toBe('blockLayout');
      }
    });

    it('should succeed for valid blockType values', () => {
      const validTypes = [
        'lecture',
        'lab',
        'workshop',
        'review',
        'quiz',
        'exam',
        'warm-up',
        'practice',
        'learn',
      ];

      for (const type of validTypes) {
        const block: RawBlock = {
          name: 'Test Block',
          dashedName: 'test-block',
          helpCategory: 'test',
          challengeOrder: [{ id: 'c1', title: 'Challenge 1' }],
          blockLayout: 'challenge-list',
          blockType: type as RawBlockType,
          isUpcomingChange: false,
        };

        const result = validateBlockEnums(block, 'test-path.json');
        expect(result.success).toBe(true);
      }
    });

    it('should succeed when blockType is not provided', () => {
      const block: RawBlock = {
        name: 'Test Block',
        dashedName: 'test-block',
        helpCategory: 'test',
        challengeOrder: [{ id: 'c1', title: 'Challenge 1' }],
        blockLayout: 'challenge-list',
        isUpcomingChange: false,
      };

      const result = validateBlockEnums(block, 'test-path.json');
      expect(result.success).toBe(true);
    });

    it('should fail for invalid blockType', () => {
      const block = {
        dashedName: 'test-block',
        challengeOrder: [{ id: 'c1', title: 'Challenge 1' }],
        blockLayout: 'challenge-list',
        blockType: 'invalid-type',
      } as unknown as RawBlock;

      const result = validateBlockEnums(block, 'test-block.json');
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.message).toContain('invalid-type');
        expect(result.error.message).toContain('blockType');
        expect(result.error.filePath).toBe('test-block.json');
        expect(result.error.field).toBe('blockType');
      }
    });
  });

  describe('validateChallengeStructure()', () => {
    it('should succeed for valid challenge structure', () => {
      const challenges: readonly RawChallenge[] = [
        { id: 'c1', title: 'Challenge 1' },
        { id: 'c2', title: 'Challenge 2' },
        { id: 'c3', title: 'Challenge 3' },
      ];

      const result = validateChallengeStructure(challenges, 'test-block.json');
      expect(result.success).toBe(true);
    });

    it('should fail for empty challenge array', () => {
      const challenges: readonly RawChallenge[] = [];

      const result = validateChallengeStructure(challenges, 'test-block.json');
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.message).toContain('must not be empty');
        expect(result.error.filePath).toBe('test-block.json');
        expect(result.error.field).toBe('challengeOrder');
      }
    });

    it('should fail when challenge is missing id field', () => {
      const challenges = [
        { id: 'c1', title: 'Challenge 1' },
        { title: 'Challenge 2' }, // Missing id
      ] as unknown as readonly RawChallenge[];

      const result = validateChallengeStructure(challenges, 'test-block.json');
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.message).toContain('index 1');
        expect(result.error.message).toContain('id');
        expect(result.error.field).toContain('challengeOrder[1].id');
      }
    });

    it('should fail when challenge id is not a string', () => {
      const challenges = [
        { id: 123, title: 'Challenge 1' },
      ] as unknown as readonly RawChallenge[];

      const result = validateChallengeStructure(challenges, 'test-block.json');
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.message).toContain('id');
      }
    });

    it('should fail when challenge is missing title field', () => {
      const challenges = [
        { id: 'c1', title: 'Challenge 1' },
        { id: 'c2' }, // Missing title
      ] as unknown as readonly RawChallenge[];

      const result = validateChallengeStructure(challenges, 'test-block.json');
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.message).toContain('index 1');
        expect(result.error.message).toContain('title');
        expect(result.error.field).toContain('challengeOrder[1].title');
      }
    });

    it('should fail when challenge title is not a string', () => {
      const challenges = [
        { id: 'c1', title: 123 },
      ] as unknown as readonly RawChallenge[];

      const result = validateChallengeStructure(challenges, 'test-block.json');
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.message).toContain('title');
      }
    });

    it('should fail when challenge is null', () => {
      const challenges = [
        { id: 'c1', title: 'Challenge 1' },
        null,
      ] as unknown as readonly RawChallenge[];

      const result = validateChallengeStructure(challenges, 'test-block.json');
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.message).toContain('index 1');
      }
    });

    it('should validate first challenge in array', () => {
      const challenges = [
        { title: 'Challenge 1' }, // Missing id at index 0
      ] as unknown as readonly RawChallenge[];

      const result = validateChallengeStructure(challenges, 'test-block.json');
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.message).toContain('index 0');
        expect(result.error.field).toContain('challengeOrder[0].id');
      }
    });
  });
});
