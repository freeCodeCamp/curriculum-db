import type { ChallengeResolvers } from '../types.generated.js';

export const Challenge: ChallengeResolvers = {
  block: (parent, _args, context) => context.getBlock(parent.blockDashedName)!,

  content: () => null,
};
