import type { BlockResolvers } from '../types.generated.js';
import { GraphQLError } from 'graphql';

export const Block: BlockResolvers = {
  superblock: (parent, _args, context) => {
    const superblock = context.getSuperblock(parent.superblockDashedName);
    if (!superblock) {
      throw new GraphQLError(
        `Superblock not found for block: ${parent.dashedName}`,
        {
          extensions: {
            code: 'SUPERBLOCK_NOT_FOUND',
            blockDashedName: parent.dashedName,
            superblockDashedName: parent.superblockDashedName,
          },
        }
      );
    }
    return superblock;
  },

  challengeOrder: (parent) => [...parent.challenges],
};
