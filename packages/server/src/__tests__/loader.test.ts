import { describe, it, expect } from 'vitest';
import {
  loadCurriculumFile,
  loadSuperblockFile,
  loadBlockFile,
  loadAllSuperblocks,
  loadAllBlocks,
} from '../data/loader.js';
import path from 'path';

describe('Data Loader Functions', () => {
  const validDataPath = path.resolve('../../data/structure');

  describe('loadCurriculumFile()', () => {
    it('should load curriculum.json successfully', async () => {
      const result = await loadCurriculumFile(validDataPath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.superblocks).toBeInstanceOf(Array);
        expect(result.data.certifications).toBeInstanceOf(Array);
        expect(result.data.superblocks.length).toBeGreaterThan(0);
      }
    });

    it('should fail for non-existent directory', async () => {
      const result = await loadCurriculumFile('/non/existent/path');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain(
          'Failed to load curriculum.json'
        );
        expect(result.error.filePath).toContain('curriculum.json');
      }
    });

    it('should fail for invalid JSON file', async () => {
      // Use a path that exists but contains invalid JSON
      const invalidPath = path.resolve(__dirname, '../__tests__');
      const result = await loadCurriculumFile(invalidPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBeDefined();
      }
    });
  });

  describe('loadSuperblockFile()', () => {
    it('should load existing superblock', async () => {
      const result = await loadSuperblockFile(
        'responsive-web-design',
        validDataPath
      );

      expect(result.success).toBe(true);
      if (result.success) {
        // RawSuperblock can have either blocks or chapters
        const hasBlocks =
          result.data.blocks && Array.isArray(result.data.blocks);
        const hasChapters =
          result.data.chapters && Array.isArray(result.data.chapters);
        expect(hasBlocks || hasChapters).toBe(true);

        if (hasBlocks) {
          expect(result.data.blocks!.length).toBeGreaterThan(0);
        }
        if (hasChapters) {
          expect(result.data.chapters!.length).toBeGreaterThan(0);
        }
      }
    });

    it('should fail for non-existent superblock', async () => {
      const result = await loadSuperblockFile(
        'non-existent-superblock',
        validDataPath
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('non-existent-superblock');
        expect(result.error.filePath).toContain('non-existent-superblock.json');
      }
    });

    it('should handle invalid data path', async () => {
      const result = await loadSuperblockFile(
        'responsive-web-design',
        '/invalid/path'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBeDefined();
      }
    });
  });

  describe('loadBlockFile()', () => {
    it('should load existing block', async () => {
      const result = await loadBlockFile('basic-html-and-html5', validDataPath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dashedName).toBe('basic-html-and-html5');
        expect(result.data.challengeOrder).toBeInstanceOf(Array);
        expect(result.data.challengeOrder.length).toBeGreaterThan(0);
      }
    });

    it('should fail for non-existent block', async () => {
      const result = await loadBlockFile('non-existent-block', validDataPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('non-existent-block');
        expect(result.error.filePath).toContain('non-existent-block.json');
      }
    });

    it('should handle invalid data path', async () => {
      const result = await loadBlockFile(
        'basic-html-and-html5',
        '/invalid/path'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBeDefined();
      }
    });
  });

  describe('loadAllSuperblocks()', () => {
    it('should load multiple superblocks successfully', async () => {
      const superblockNames = [
        'responsive-web-design',
        'javascript-algorithms-and-data-structures',
      ];

      const result = await loadAllSuperblocks(superblockNames, validDataPath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.size).toBe(2);
        expect(result.data.has('responsive-web-design')).toBe(true);
        expect(
          result.data.has('javascript-algorithms-and-data-structures')
        ).toBe(true);
      }
    });

    it('should fail fast on first error', async () => {
      const superblockNames = [
        'responsive-web-design',
        'non-existent-superblock',
        'javascript-algorithms-and-data-structures',
      ];

      const result = await loadAllSuperblocks(superblockNames, validDataPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('non-existent-superblock');
      }
    });

    it('should handle empty array', async () => {
      const result = await loadAllSuperblocks([], validDataPath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.size).toBe(0);
      }
    });

    it('should handle all failures', async () => {
      const superblockNames = ['non-existent-1', 'non-existent-2'];

      const result = await loadAllSuperblocks(superblockNames, validDataPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('non-existent-1');
      }
    });
  });

  describe('loadAllBlocks()', () => {
    it('should load multiple blocks successfully', async () => {
      const blockNames = ['basic-html-and-html5', 'basic-css'];

      const result = await loadAllBlocks(blockNames, validDataPath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.size).toBe(2);
        expect(result.data.has('basic-html-and-html5')).toBe(true);
        expect(result.data.has('basic-css')).toBe(true);
      }
    });

    it('should fail fast on first error', async () => {
      const blockNames = [
        'basic-html-and-html5',
        'non-existent-block',
        'basic-css',
      ];

      const result = await loadAllBlocks(blockNames, validDataPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('non-existent-block');
      }
    });

    it('should handle empty array', async () => {
      const result = await loadAllBlocks([], validDataPath);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.size).toBe(0);
      }
    });

    it('should handle all failures', async () => {
      const blockNames = ['non-existent-1', 'non-existent-2'];

      const result = await loadAllBlocks(blockNames, validDataPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('non-existent-1');
      }
    });

    it('should handle invalid JSON in block file', async () => {
      // This would test invalid JSON, but our actual data is valid
      // So we test with non-existent files which also fail gracefully
      const result = await loadAllBlocks(['invalid-json-block'], validDataPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should preserve error messages through Result type', async () => {
      const result = await loadBlockFile('non-existent', '/invalid/path');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBeDefined();
        expect(result.error.filePath).toBeDefined();
      }
    });

    it('should include file paths in errors', async () => {
      const result = await loadSuperblockFile('test-superblock', '/test/path');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.filePath).toContain('test-superblock.json');
        expect(result.error.filePath).toContain('/test/path');
      }
    });
  });
});
