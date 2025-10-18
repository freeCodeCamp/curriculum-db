import { describe, it, expect } from 'vitest';
import { initializeDataStore } from '../data/index.js';
import { getTestDataStore } from './setup.js';
import { BlockLayout, BlockType } from '../data/types.js';

describe('Data Loading Validation', () => {
  describe('initializeDataStore()', () => {
    it('should return success Result', async () => {
      const result = await initializeDataStore('../../data/structure');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data.curriculum).toBeDefined();
      }
    });
  });

  describe('Curriculum Files', () => {
    it('should parse all curriculum.json files successfully', async () => {
      const store = await getTestDataStore();

      // Curriculum should be loaded
      expect(store.curriculum).toBeDefined();
      expect(store.curriculum.superblocks).toBeInstanceOf(Array);
      expect(store.curriculum.certifications).toBeInstanceOf(Array);

      // Should have expected counts
      expect(store.curriculum.superblocks.length).toBeGreaterThan(0);
      expect(store.curriculum.certifications.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-Reference Validation', () => {
    it('should verify superblock cross-references are valid', async () => {
      const store = await getTestDataStore();

      // All loaded superblocks should have valid data
      for (const superblock of store.superblocks.values()) {
        expect(superblock.dashedName).toBeDefined();
        expect(typeof superblock.dashedName).toBe('string');

        // Superblock should be in curriculum list
        expect(store.curriculum.superblocks).toContain(superblock.dashedName);
      }

      // Should have loaded a significant number of superblocks
      expect(store.superblocks.size).toBeGreaterThan(20);
    });

    it('should verify block cross-references are valid', async () => {
      const store = await getTestDataStore();

      // All blocks referenced in superblocks should exist
      for (const superblock of store.superblocks.values()) {
        for (const blockName of superblock.blocks) {
          const block = store.blocks.get(blockName);
          expect(block).toBeDefined();
          expect(block?.dashedName).toBe(blockName);

          // Block should reference back to its superblock
          expect(block?.superblockDashedName).toBe(superblock.dashedName);
        }
      }
    });
  });

  describe('Enum Validation', () => {
    it('should verify BlockLayout enum values conform to defined types', async () => {
      const store = await getTestDataStore();
      const validLayouts = Object.values(BlockLayout);

      for (const block of store.blocks.values()) {
        expect(validLayouts).toContain(block.blockLayout);
      }
    });

    it('should verify BlockType enum values conform to defined types', async () => {
      const store = await getTestDataStore();
      const validTypes = Object.values(BlockType);

      for (const block of store.blocks.values()) {
        // BlockType is optional, so null is valid
        if (block.blockType !== null) {
          expect(validTypes).toContain(block.blockType);
        }
      }
    });
  });

  describe('Challenge Metadata', () => {
    it('should verify all challenges have valid IDs and titles', async () => {
      const store = await getTestDataStore();

      // Every challenge should have an ID and title
      for (const challenge of store.challenges.values()) {
        expect(challenge.id).toBeDefined();
        expect(typeof challenge.id).toBe('string');
        expect(challenge.id.length).toBeGreaterThan(0);

        expect(challenge.title).toBeDefined();
        expect(typeof challenge.title).toBe('string');
        expect(challenge.title.length).toBeGreaterThan(0);

        // Challenge should reference a valid block
        const block = store.blocks.get(challenge.blockDashedName);
        expect(block).toBeDefined();
      }

      // Should have loaded a significant number of challenges
      expect(store.challenges.size).toBeGreaterThan(10000);
    });
  });
});
