import type { ChapterResolvers } from '../types.generated.js';

export const Chapter: ChapterResolvers = {
  superblock: (parent, _args, context) => {
    const superblock = context.getSuperblock(parent.superblockDashedName);
    if (!superblock) {
      throw new Error(
        `Superblock not found for chapter: ${parent.superblockDashedName}`
      );
    }
    return superblock;
  },
};
