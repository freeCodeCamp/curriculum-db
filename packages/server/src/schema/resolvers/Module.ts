import type { ModuleResolvers } from '../types.generated.js';

export const Module: ModuleResolvers = {
  blockObjects: (parent, _args, context) => {
    const blocks = parent.blocks
      .map((blockName) => context.getBlock(blockName))
      .filter((block) => block !== null);
    return blocks;
  },

  chapter: (parent, _args, context) => {
    const superblock = context.getSuperblock(parent.superblockDashedName);

    if (!superblock) {
      throw new Error(
        `Superblock not found for module: ${parent.superblockDashedName}`
      );
    }

    for (const chapter of superblock.chapters) {
      if (chapter.dashedName === parent.chapterDashedName) {
        return chapter;
      }
    }

    throw new Error(
      `Chapter "${parent.chapterDashedName}" not found in superblock "${parent.superblockDashedName}"`
    );
  },
};
