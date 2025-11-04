import type { BlockResolvers } from '../types.generated.js';

export const Block: BlockResolvers = {
  superblocks: (parent, _args, context) => {
    const superblocks = [];
    for (const superblockName of parent.superblockDashedNames) {
      const superblock = context.getSuperblock(superblockName);
      if (superblock) {
        superblocks.push(superblock);
      }
    }
    return superblocks;
  },

  challengeOrder: (parent) => [...parent.challenges],
};
