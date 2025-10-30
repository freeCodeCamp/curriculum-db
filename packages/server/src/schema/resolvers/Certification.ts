import type { CertificationResolvers } from '../types.generated.js';
import { GraphQLError } from 'graphql';

export const Certification: CertificationResolvers = {
  superblock: (parent, _args, context) => {
    const superblock = context.getSuperblock(parent.dashedName);
    if (!superblock) {
      throw new GraphQLError(
        `Superblock not found for certification: ${parent.dashedName}`,
        {
          extensions: {
            code: 'SUPERBLOCK_NOT_FOUND',
            certificationDashedName: parent.dashedName,
          },
        }
      );
    }
    return superblock;
  },
};
