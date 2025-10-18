import type { BlockResolvers } from '../types.generated.js';

export const Block: BlockResolvers = {
  superblock: (parent, _args, context) =>
    context.getSuperblock(parent.superblockDashedName)!,

  challengeOrder: (parent) => [...parent.challenges],
};
