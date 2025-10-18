import type {
  DataProvider,
  DataStore,
  CurriculumData,
  SuperblockData,
  BlockData,
  ChallengeMetadata,
} from './types.js';

/**
 * InMemoryDataProvider implementation
 * Implements DataProvider interface for in-memory data access
 */

/**
 * In-memory implementation of DataProvider interface
 * Provides O(1) access to curriculum metadata from readonly Maps
 */
export class InMemoryDataProvider implements DataProvider {
  constructor(private readonly store: DataStore) {}

  /**
   * Get top-level curriculum data
   * @returns CurriculumData (always present)
   */
  getCurriculum(): CurriculumData {
    return this.store.curriculum;
  }

  /**
   * Get superblock by dashedName
   * @param dashedName Superblock identifier
   * @returns SuperblockData or null if not found
   */
  getSuperblock(dashedName: string): SuperblockData | null {
    return this.store.superblocks.get(dashedName) ?? null;
  }

  /**
   * Get block by dashedName
   * @param dashedName Block identifier
   * @returns BlockData or null if not found
   */
  getBlock(dashedName: string): BlockData | null {
    return this.store.blocks.get(dashedName) ?? null;
  }

  /**
   * Get challenge metadata by id
   * @param id Challenge UUID identifier
   * @returns ChallengeMetadata or null if not found
   */
  getChallenge(id: string): ChallengeMetadata | null {
    return this.store.challenges.get(id) ?? null;
  }
}
