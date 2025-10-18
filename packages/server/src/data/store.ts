import type {
  CurriculumData,
  SuperblockData,
  BlockData,
  ChallengeMetadata,
  DataStore,
} from './types.js';

/**
 * DataStore construction
 * Builds readonly Maps from normalized data
 */

/**
 * Build DataStore with readonly Maps from normalized data
 * @param curriculum Normalized curriculum data
 * @param superblocks Map of dashedName → SuperblockData
 * @param blocks Map of dashedName → BlockData
 * @param challenges Map of id → ChallengeMetadata
 * @returns DataStore with all Maps converted to ReadonlyMap
 */
export function buildDataStore(
  curriculum: CurriculumData,
  superblocks: Map<string, SuperblockData>,
  blocks: Map<string, BlockData>,
  challenges: Map<string, ChallengeMetadata>
): DataStore {
  return {
    curriculum,
    superblocks: superblocks as ReadonlyMap<string, SuperblockData>,
    blocks: blocks as ReadonlyMap<string, BlockData>,
    challenges: challenges as ReadonlyMap<string, ChallengeMetadata>,
  };
}
