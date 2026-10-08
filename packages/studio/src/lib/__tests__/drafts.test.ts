import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveDraftRecord,
  loadDraftRecord,
  discardDraftRecord,
  applyDraftPatch,
  isDraftOutdated,
  listAllDrafts,
  parseDraftKey,
  getDraftKey,
  exportDraftPatch,
} from '../drafts';
import { hashObject } from '../utils';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const key of Object.keys(store)) delete store[key];
  },
  get length() {
    return Object.keys(store).length;
  },
  key: (i: number) => Object.keys(store)[i] ?? null,
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

const sampleBlock = {
  name: 'Basic HTML',
  dashedName: 'basic-html',
  helpCategory: 'HTML-CSS',
  blockLayout: 'CHALLENGE_LIST',
  blockLabel: 'LECTURE',
  isUpcomingChange: false,
  usesMultifileEditor: false,
  hasEditableBoundaries: null,
  challengeOrder: [
    { id: 'abc123', title: 'Say Hello' },
    { id: 'def456', title: 'Add an Image' },
    { id: 'ghi789', title: 'Link to External Pages' },
  ],
  superblocks: [
    { name: 'Responsive Web Design', dashedName: 'responsive-web-design' },
  ],
};

describe('Draft Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getDraftKey / parseDraftKey', () => {
    it('generates correct key', () => {
      expect(getDraftKey('block', 'basic-html')).toBe('draft:block:basic-html');
      expect(getDraftKey('challenge', 'abc-123')).toBe(
        'draft:challenge:abc-123'
      );
    });

    it('parses valid keys', () => {
      expect(parseDraftKey('draft:block:basic-html')).toEqual({
        type: 'block',
        id: 'basic-html',
      });
      expect(parseDraftKey('draft:challenge:abc-123')).toEqual({
        type: 'challenge',
        id: 'abc-123',
      });
    });

    it('returns null for invalid keys', () => {
      expect(parseDraftKey('other:key')).toBeNull();
      expect(parseDraftKey('draft:invalid:id')).toBeNull();
    });
  });

  describe('saveDraftRecord / loadDraftRecord', () => {
    it('saves and loads a draft', () => {
      const modified = { ...sampleBlock, helpCategory: 'JavaScript' };
      saveDraftRecord('block', 'basic-html', sampleBlock, modified);

      const loaded = loadDraftRecord('block', 'basic-html');
      expect(loaded).not.toBeNull();
      expect(loaded!.patch.length).toBeGreaterThan(0);
      expect(loaded!.originalHash).toBe(hashObject(sampleBlock));
      expect(loaded!.updatedAt).toBeTruthy();
    });

    it('returns empty patch when no changes', () => {
      const result = saveDraftRecord(
        'block',
        'basic-html',
        sampleBlock,
        sampleBlock
      );
      expect(result).toEqual([]);
      expect(loadDraftRecord('block', 'basic-html')).toBeNull();
    });

    it('returns null for non-existent draft', () => {
      expect(loadDraftRecord('block', 'nonexistent')).toBeNull();
    });
  });

  describe('applyDraftPatch', () => {
    it('applies a simple field change', () => {
      const modified = { ...sampleBlock, helpCategory: 'JavaScript' };
      const patch = saveDraftRecord(
        'block',
        'basic-html',
        sampleBlock,
        modified
      );

      const result = applyDraftPatch(sampleBlock, patch);
      expect(result.helpCategory).toBe('JavaScript');
      // Original should be unchanged
      expect(sampleBlock.helpCategory).toBe('HTML-CSS');
    });

    it('applies challenge reorder', () => {
      const reordered = {
        ...sampleBlock,
        challengeOrder: [
          sampleBlock.challengeOrder[2]!,
          sampleBlock.challengeOrder[0]!,
          sampleBlock.challengeOrder[1]!,
        ],
      };
      const patch = saveDraftRecord(
        'block',
        'basic-html',
        sampleBlock,
        reordered
      );

      const result = applyDraftPatch(sampleBlock, patch);
      expect(result.challengeOrder[0]!.id).toBe('ghi789');
      expect(result.challengeOrder[1]!.id).toBe('abc123');
      expect(result.challengeOrder[2]!.id).toBe('def456');
    });

    it('applies challenge title edit', () => {
      const modified = {
        ...sampleBlock,
        challengeOrder: sampleBlock.challengeOrder.map((c, i) =>
          i === 0 ? { ...c, title: 'New Title' } : c
        ),
      };
      const patch = saveDraftRecord(
        'block',
        'basic-html',
        sampleBlock,
        modified
      );

      const result = applyDraftPatch(sampleBlock, patch);
      expect(result.challengeOrder[0]!.title).toBe('New Title');
      expect(result.challengeOrder[1]!.title).toBe('Add an Image');
    });
  });

  describe('discardDraftRecord', () => {
    it('removes the draft from storage', () => {
      const modified = { ...sampleBlock, helpCategory: 'JavaScript' };
      saveDraftRecord('block', 'basic-html', sampleBlock, modified);
      expect(loadDraftRecord('block', 'basic-html')).not.toBeNull();

      discardDraftRecord('block', 'basic-html');
      expect(loadDraftRecord('block', 'basic-html')).toBeNull();
    });
  });

  describe('isDraftOutdated', () => {
    it('detects outdated draft', () => {
      const modified = { ...sampleBlock, helpCategory: 'JavaScript' };
      saveDraftRecord('block', 'basic-html', sampleBlock, modified);
      const record = loadDraftRecord('block', 'basic-html')!;

      // Same original -> not outdated
      expect(isDraftOutdated(record, sampleBlock)).toBe(false);

      // Different original -> outdated
      const newOriginal = { ...sampleBlock, helpCategory: 'Python' };
      expect(isDraftOutdated(record, newOriginal)).toBe(true);
    });
  });

  describe('listAllDrafts', () => {
    it('lists all stored drafts', () => {
      saveDraftRecord('block', 'basic-html', sampleBlock, {
        ...sampleBlock,
        helpCategory: 'JS',
      });
      saveDraftRecord(
        'challenge',
        'abc123',
        { id: 'abc123', title: 'Old' },
        { id: 'abc123', title: 'New' }
      );

      const drafts = listAllDrafts();
      expect(drafts).toHaveLength(2);
      expect(drafts.map((d) => d.type).sort()).toEqual(['block', 'challenge']);
    });

    it('returns empty array when no drafts', () => {
      expect(listAllDrafts()).toEqual([]);
    });
  });

  describe('exportDraftPatch', () => {
    it('exports patch as JSON string', () => {
      saveDraftRecord('block', 'basic-html', sampleBlock, {
        ...sampleBlock,
        helpCategory: 'JavaScript',
      });

      const exported = exportDraftPatch('block', 'basic-html');
      expect(exported).not.toBeNull();

      const parsed = JSON.parse(exported!);
      expect(parsed.type).toBe('block');
      expect(parsed.id).toBe('basic-html');
      expect(parsed.patch).toBeDefined();
      expect(parsed.patch.length).toBeGreaterThan(0);
    });

    it('returns null when no draft exists', () => {
      expect(exportDraftPatch('block', 'nonexistent')).toBeNull();
    });
  });
});
