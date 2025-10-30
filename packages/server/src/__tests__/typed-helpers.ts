import type { Query } from '../schema/types.generated.js';

/**
 * Type-safe GraphQL query response types
 * These types represent the exact shape of data returned by each query
 */

export type CurriculumQueryResponse = {
  curriculum: Query['curriculum'];
};

export type SuperblockQueryResponse = {
  superblock: Query['superblock'];
};

export type SuperblocksQueryResponse = {
  superblocks: Query['superblocks'];
};

export type BlockQueryResponse = {
  block: Query['block'];
};

export type BlocksQueryResponse = {
  blocks: Query['blocks'];
};

export type ChallengeQueryResponse = {
  challenge: Query['challenge'];
};

export type ChallengesQueryResponse = {
  challenges: Query['challenges'];
};

export type CertificationsQueryResponse = {
  certifications: Query['certifications'];
};

export type HealthCheckQueryResponse = {
  _health: Query['_health'];
};

/**
 * Extended certification query response with superblock details
 */
export type CertificationsWithSuperblockQueryResponse = {
  certifications: Array<{
    dashedName: string;
    superblock: {
      dashedName: string;
      isCertification: boolean;
      blockObjects: Array<{
        isUpcomingChange: boolean;
      }>;
    };
  }>;
};
