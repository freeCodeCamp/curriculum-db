import type { QueryResolvers } from '../types.generated.js';
import type { BlockData, ChallengeMetadata } from '../../data/types.js';
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

    // No filter: return all blocks
    const curriculum = context.getCurriculum();
    const allBlocks: BlockData[] = [];
    for (const sbName of curriculum.superblocks) {
      const superblock = context.getSuperblock(sbName);
      if (superblock) {
        for (const blockName of superblock.blocks) {
          const block = context.getBlock(blockName);
          if (block) allBlocks.push(block);
        }
      }
    }
    return allBlocks;
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
    return curriculum.certifications
      .filter((dashedName) => context.getSuperblock(dashedName) !== null)
      .map((dashedName) => ({ dashedName }));
  },

  // Health monitoring
  _health: (_parent, _args, context) => {
    const curriculum = context.getCurriculum();

    // Count superblocks
    const superblockCount = curriculum.superblocks.length;

    // Count blocks across all superblocks
    let blockCount = 0;
    for (const sbName of curriculum.superblocks) {
      const sb = context.getSuperblock(sbName);
      if (sb) blockCount += sb.blocks.length;
    }

    // Count challenges across all blocks
    let challengeCount = 0;
    for (const sbName of curriculum.superblocks) {
      const sb = context.getSuperblock(sbName);
      if (sb) {
        for (const blockName of sb.blocks) {
          const block = context.getBlock(blockName);
          if (block) challengeCount += block.challenges.length;
        }
      }
    }

    // Calculate memory usage
    const memoryUsageMB =
      Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;

    return {
      status: 'healthy',
      uptime: getUptimeSeconds(),
      dataStore: {
        superblockCount,
        blockCount,
        challengeCount,
        memoryUsageMB,
      },
    };
  },
};
