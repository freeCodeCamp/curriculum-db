import type { QueryResolvers } from '../types.generated.js';
import type {
  BlockData,
  ChallengeMetadata,
  ChapterData,
  ModuleData,
} from '../../data/types.js';
import { getUptimeSeconds } from '../../uptime.js';

export const Query: QueryResolvers = {
  // User Story 1: Basic curriculum structure
  curriculum: (_parent, _args, context) => context.getCurriculum(),

  // User Story 2: Navigation queries
  superblock: (_parent, { dashedName }, context) =>
    context.getSuperblock(dashedName),

  superblocks: (_parent, _args, context) => {
    const curriculum = context.getCurriculum();
    return curriculum.superblocks
      .map((name) => context.getSuperblock(name))
      .filter((sb): sb is NonNullable<typeof sb> => sb !== null);
  },

  block: (_parent, { dashedName }, context) => context.getBlock(dashedName),

  challenge: (_parent, { id }, context) => context.getChallenge(id),

  // User Story 3: Filtered list queries
  blocks: (_parent, { superblockDashedName }, context) => {
    if (superblockDashedName) {
      const superblock = context.getSuperblock(superblockDashedName);
      if (!superblock) return [];

      return superblock.blocks
        .map((name) => context.getBlock(name))
        .filter((block): block is BlockData => block !== null);
    }

    // No filter: return all unique blocks (deduplicated)
    // Note: In v9 curriculum, blocks can appear in multiple superblocks
    const curriculum = context.getCurriculum();
    const blockMap = new Map<string, BlockData>();

    for (const sbName of curriculum.superblocks) {
      const superblock = context.getSuperblock(sbName);
      if (superblock) {
        for (const blockName of superblock.blocks) {
          if (!blockMap.has(blockName)) {
            const block = context.getBlock(blockName);
            if (block) blockMap.set(blockName, block);
          }
        }
      }
    }

    return Array.from(blockMap.values());
  },

  challenges: (_parent, { blockDashedName }, context) => {
    if (blockDashedName) {
      const block = context.getBlock(blockDashedName);
      if (!block) return [];
      return [...block.challenges];
    }

    // No filter: return all challenges
    const curriculum = context.getCurriculum();
    const allChallenges: ChallengeMetadata[] = [];
    for (const sbName of curriculum.superblocks) {
      const superblock = context.getSuperblock(sbName);
      if (superblock) {
        for (const blockName of superblock.blocks) {
          const block = context.getBlock(blockName);
          if (block) {
            allChallenges.push(...block.challenges);
          }
        }
      }
    }
    return allChallenges;
  },

  // User Story 4: Certifications
  certifications: (_parent, _args, context) => {
    const curriculum = context.getCurriculum();
    // Filter out certifications that don't have loaded superblocks
    return curriculum.certifications
      .filter((dashedName) => context.getSuperblock(dashedName) !== null)
      .map((dashedName) => ({ dashedName }));
  },

  // V9 Curriculum: Chapters
  chapters: (_parent, { superblockDashedName }, context) => {
    if (superblockDashedName) {
      const superblock = context.getSuperblock(superblockDashedName);
      if (!superblock) return [];
      return [...superblock.chapters];
    }

    // No filter: return all chapters from all superblocks
    const curriculum = context.getCurriculum();
    const allChapters: ChapterData[] = [];
    for (const sbName of curriculum.superblocks) {
      const superblock = context.getSuperblock(sbName);
      if (superblock) {
        allChapters.push(...superblock.chapters);
      }
    }
    return allChapters;
  },

  // V9 Curriculum: Modules
  modules: (_parent, { superblockDashedName, chapterDashedName }, context) => {
    // Filter by specific chapter (most specific)
    if (chapterDashedName) {
      const curriculum = context.getCurriculum();
      for (const sbName of curriculum.superblocks) {
        const superblock = context.getSuperblock(sbName);
        if (superblock) {
          const chapter = superblock.chapters.find(
            (ch) => ch.dashedName === chapterDashedName
          );
          if (chapter) return [...chapter.modules];
        }
      }
      return [];
    }

    // Filter by superblock
    if (superblockDashedName) {
      const superblock = context.getSuperblock(superblockDashedName);
      if (!superblock) return [];

      const allModules: ModuleData[] = [];
      for (const chapter of superblock.chapters) {
        allModules.push(...chapter.modules);
      }
      return allModules;
    }

    // No filter: return all modules from all chapters
    const curriculum = context.getCurriculum();
    const allModules: ModuleData[] = [];
    for (const sbName of curriculum.superblocks) {
      const superblock = context.getSuperblock(sbName);
      if (superblock) {
        for (const chapter of superblock.chapters) {
          allModules.push(...chapter.modules);
        }
      }
    }
    return allModules;
  },

  // Health monitoring
  _health: (_parent, _args, context) => {
    const curriculum = context.getCurriculum();

    // Count superblocks
    const superblockCount = curriculum.superblocks.length;

    // Count chapters and modules (v9 curriculum primitives)
    let chapterCount = 0;
    let moduleCount = 0;
    for (const sbName of curriculum.superblocks) {
      const sb = context.getSuperblock(sbName);
      if (sb) {
        chapterCount += sb.chapters.length;
        for (const chapter of sb.chapters) {
          moduleCount += chapter.modules.length;
        }
      }
    }

    // Count unique blocks (deduplicate since blocks can appear in multiple superblocks)
    const uniqueBlocks = new Set<string>();
    for (const sbName of curriculum.superblocks) {
      const sb = context.getSuperblock(sbName);
      if (sb) {
        for (const blockName of sb.blocks) {
          uniqueBlocks.add(blockName);
        }
      }
    }
    const blockCount = uniqueBlocks.size;

    // Count unique challenges (deduplicate via block deduplication)
    let challengeCount = 0;
    for (const blockName of uniqueBlocks) {
      const block = context.getBlock(blockName);
      if (block) challengeCount += block.challenges.length;
    }

    // Calculate memory usage
    const memoryUsageMB =
      Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;

    return {
      status: 'healthy',
      uptime: getUptimeSeconds(),
      dataStore: {
        superblockCount,
        chapterCount,
        moduleCount,
        blockCount,
        challengeCount,
        memoryUsageMB,
      },
    };
  },
};
