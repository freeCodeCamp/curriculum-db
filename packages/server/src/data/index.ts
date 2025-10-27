import path from 'path';
import {
  type Result,
  type DataStore,
  type SuperblockData,
  type BlockData,
  type ChallengeMetadata,
  DataValidationError,
} from './types.js';
import {
  loadCurriculumFile,
  loadAllSuperblocks,
  loadAllBlocks,
} from './loader.js';
import {
  validateCurriculumReferences,
  validateSuperblockReferences,
  validateBlockEnums,
  validateChallengeStructure,
} from './validators.js';
import {
  normalizeCurriculum,
  normalizeSuperblock,
  normalizeBlock,
} from './normalizer.js';
import { buildDataStore } from './store.js';

/**
 * Initialize DataStore from curriculum JSON files
 * Orchestrates the full data loading pipeline:
 * 1. Load all JSON files in parallel
 * 2. Validate all references and enums
 * 3. Normalize Raw types to internal types
 * 4. Build DataStore with readonly Maps
 *
 * @param dataPath Absolute path to data/structure/ directory
 * @returns Result containing fully initialized DataStore or first error encountered
 */
export async function initializeDataStore(
  dataPath: string
): Promise<Result<DataStore, DataValidationError>> {
  // Phase 1: Load curriculum.json
  const curriculumResult = await loadCurriculumFile(dataPath);
  if (!curriculumResult.success) return curriculumResult;
  const rawCurriculum = curriculumResult.data;

  // Phase 2: Load all superblocks in parallel
  const superblockResult = await loadAllSuperblocks(
    rawCurriculum.superblocks,
    dataPath
  );
  if (!superblockResult.success) return superblockResult;
  const rawSuperblocks = superblockResult.data;

  // Phase 3: Collect all block names from all superblocks
  // Note: Some superblocks use a different structure (chapters/modules) and are skipped
  const allBlockNames: string[] = [];
  const validSuperblocks = new Map<
    string,
    import('./types.js').RawSuperblock
  >();

  for (const [superblockName, superblock] of rawSuperblocks.entries()) {
    // Skip superblocks with non-standard structure (e.g., chapters/modules)
    if (!superblock.blocks || !Array.isArray(superblock.blocks)) {
      console.warn(
        `Skipping superblock "${superblockName}" - uses non-standard structure`
      );
      continue;
    }
    validSuperblocks.set(superblockName, superblock);
    const blocks = superblock.blocks as string[];
    allBlockNames.push(...blocks);
  }

  // Phase 4: Load all blocks in parallel
  const blockResult = await loadAllBlocks(allBlockNames, dataPath);
  if (!blockResult.success) return blockResult;
  const rawBlocks = blockResult.data;

  // Phase 5: Validate all references
  const curriculumValidation = validateCurriculumReferences();
  if (!curriculumValidation.success) return curriculumValidation;

  const superblockValidation = validateSuperblockReferences(
    validSuperblocks,
    rawBlocks
  );
  if (!superblockValidation.success) return superblockValidation;

  // Phase 6: Validate enums and challenge structure
  for (const [blockName, block] of rawBlocks) {
    const enumValidation = validateBlockEnums(
      block,
      path.join(dataPath, 'blocks', `${blockName}.json`)
    );
    if (!enumValidation.success) return enumValidation;

    const challengeValidation = validateChallengeStructure(
      block.challengeOrder,
      path.join(dataPath, 'blocks', `${blockName}.json`)
    );
    if (!challengeValidation.success) return challengeValidation;
  }

  // Phase 7: Normalize curriculum
  const curriculum = normalizeCurriculum(rawCurriculum);
  const certSet = new Set(curriculum.certifications);

  // Phase 8: Normalize superblocks (only valid ones)
  const superblocks = new Map<string, SuperblockData>(
    Array.from(validSuperblocks.entries()).map(([name, raw]) => [
      name,
      normalizeSuperblock(name, raw, certSet),
    ])
  );

  // Phase 9: Build block-to-superblock mapping (for reverse references)
  const blockToSuperblock = new Map<string, string>();
  for (const [superblockName, superblock] of superblocks) {
    for (const blockName of superblock.blocks) {
      blockToSuperblock.set(blockName, superblockName);
    }
  }

  // Phase 10: Normalize blocks with reverse references
  const blocks = new Map<string, BlockData>(
    Array.from(rawBlocks.entries()).map(([name, raw]) => {
      const superblockName = blockToSuperblock.get(name);
      if (!superblockName) {
        throw new Error(`Block "${name}" has no parent superblock`);
      }
      return [name, normalizeBlock(name, raw, superblockName)];
    })
  );

  // Phase 11: Build challenge Map (challenges already normalized in normalizeBlock)
  const challenges = new Map<string, ChallengeMetadata>(
    Array.from(blocks.values()).flatMap((block) =>
      block.challenges.map((ch) => [ch.id, ch] as const)
    )
  );

  // Phase 12: Build and return DataStore
  const store = buildDataStore(curriculum, superblocks, blocks, challenges);
  return { success: true, data: store };
}

// Barrel exports
export {
  loadCurriculumFile,
  loadSuperblockFile,
  loadBlockFile,
  loadAllSuperblocks,
  loadAllBlocks,
} from './loader.js';

export {
  validateCurriculumReferences,
  validateSuperblockReferences,
  validateBlockEnums,
  validateChallengeStructure,
} from './validators.js';

export {
  normalizeBlockLayout,
  normalizeBlockType,
  normalizeCurriculum,
  normalizeSuperblock,
  normalizeBlock,
  normalizeChallengeMetadata,
} from './normalizer.js';

export { buildDataStore } from './store.js';

export { InMemoryDataProvider } from './provider.js';

export * from './types.js';
