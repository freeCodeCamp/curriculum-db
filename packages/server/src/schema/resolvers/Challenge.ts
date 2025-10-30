import type { ChallengeResolvers } from '../types.generated.js';
import { GraphQLError } from 'graphql';

export const Challenge: ChallengeResolvers = {
  block: (parent, _args, context) => {
    const block = context.getBlock(parent.blockDashedName);
    if (!block) {
      throw new GraphQLError(`Block not found for challenge: ${parent.id}`, {
        extensions: {
          code: 'BLOCK_NOT_FOUND',
          challengeId: parent.id,
          blockDashedName: parent.blockDashedName,
        },
      });
    }
    return block;
  },

  content: () => null,
};
