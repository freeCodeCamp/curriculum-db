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
  // Supports both legacy (flat blocks) and new v9 (hierarchical chapters/modules) structures
  const allBlockNames: string[] = [];

  for (const [_superblockName, superblock] of rawSuperblocks.entries()) {
    // Legacy structure (flat blocks)
    if (superblock.blocks) {
      allBlockNames.push(...superblock.blocks);
    }

    // New v9 structure (chapters/modules)
    if (superblock.chapters) {
      for (const chapter of superblock.chapters) {
        for (const module of chapter.modules) {
          allBlockNames.push(...module.blocks);
        }
      }
    }
  }

  // Phase 4: Load all blocks in parallel
  const blockResult = await loadAllBlocks(allBlockNames, dataPath);
  if (!blockResult.success) return blockResult;
  const rawBlocks = blockResult.data;

  // Phase 5: Validate all references
  const curriculumValidation = validateCurriculumReferences();
  if (!curriculumValidation.success) return curriculumValidation;

  const superblockValidation = validateSuperblockReferences(
    rawSuperblocks,
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

  // Phase 8: Normalize all superblocks (both legacy and v9 structures)
  const superblocks = new Map<string, SuperblockData>(
    Array.from(rawSuperblocks.entries()).map(([name, raw]) => [
      name,
      normalizeSuperblock(name, raw, certSet),
    ])
  );

  // Phase 9: Build block-to-superblocks mapping (for reverse references)
  // Note: Blocks can belong to multiple superblocks in v9 curriculum
  const blockToSuperblocks = new Map<string, string[]>();
  for (const [superblockName, superblock] of superblocks) {
    for (const blockName of superblock.blocks) {
      if (!blockToSuperblocks.has(blockName)) {
        blockToSuperblocks.set(blockName, []);
      }
      blockToSuperblocks.get(blockName)!.push(superblockName);
    }
  }

  // Phase 10: Normalize blocks with reverse references
  const blocks = new Map<string, BlockData>(
    Array.from(rawBlocks.entries()).map(([name, raw]) => {
      const superblockNames = blockToSuperblocks.get(name);
      if (!superblockNames || superblockNames.length === 0) {
        throw new Error(`Block "${name}" has no parent superblock`);
      }
      return [name, normalizeBlock(name, raw, superblockNames)];
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
  normalizeBlockLabel,
  normalizeRequiredResources,
  normalizeCurriculum,
  normalizeSuperblock,
  normalizeBlock,
  normalizeChallengeMetadata,
} from './normalizer.js';

export { buildDataStore } from './store.js';

export { InMemoryDataProvider } from './provider.js';

export * from './types.js';
