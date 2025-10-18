import type { CertificationResolvers } from '../types.generated.js';

export const Certification: CertificationResolvers = {
  superblock: (parent, _args, context) =>
    context.getSuperblock(parent.dashedName)!,
};
