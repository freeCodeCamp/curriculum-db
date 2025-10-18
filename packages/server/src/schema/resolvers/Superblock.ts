import type { SuperblockResolvers } from '../types.generated.js';
import type { BlockData } from '../../data/types.js';

export const Superblock: SuperblockResolvers = {
  blockObjects: (parent, _args, context) =>
    parent.blocks
      .map((name) => context.getBlock(name))
      .filter((block): block is BlockData => block !== null),
};
