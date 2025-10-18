import { parse } from 'graphql';

/**
 * Known test data from production curriculum
 * These values are guaranteed to exist (or not exist) in the test data
 */
export const KNOWN_TEST_DATA = {
  validSuperblock: 'responsive-web-design',
  validBlock: 'learn-html-by-building-a-cat-photo-app',
  nonExistentSuperblock: 'non-existent-superblock-12345',
  nonExistentBlock: 'non-existent-block-12345',
  nonExistentChallengeId: 'non-existent-challenge-12345'
} as const;

/**
 * GraphQL query documents for testing all 8 queries
 */
export const TEST_QUERIES = {
  GET_CURRICULUM: parse(`
    query GetCurriculum {
      curriculum {
        superblocks
        certifications
      }
    }
  `),

  GET_SUPERBLOCK: parse(`
    query GetSuperblock($dashedName: String!) {
      superblock(dashedName: $dashedName) {
        dashedName
        blocks
        isCertification
        blockObjects {
          dashedName
          name
        }
      }
    }
  `),

  GET_ALL_SUPERBLOCKS: parse(`
    query GetAllSuperblocks {
      superblocks {
        dashedName
        blocks
        isCertification
      }
    }
  `),

  GET_BLOCK: parse(`
    query GetBlock($dashedName: String!) {
      block(dashedName: $dashedName) {
        name
        dashedName
        helpCategory
        blockLayout
        blockType
        isUpcomingChange
        challengeOrder {
          id
          title
        }
      }
    }
  `),

  GET_BLOCKS: parse(`
    query GetBlocks($superblockDashedName: String) {
      blocks(superblockDashedName: $superblockDashedName) {
        dashedName
        name
        blockType
        blockLayout
      }
    }
  `),

  GET_CHALLENGE: parse(`
    query GetChallenge($id: ID!) {
      challenge(id: $id) {
        id
        title
        content {
          description
          instructions
        }
        block {
          dashedName
          name
        }
      }
    }
  `),

  GET_CHALLENGES: parse(`
    query GetChallenges($blockDashedName: String) {
      challenges(blockDashedName: $blockDashedName) {
        id
        title
        content {
          description
        }
      }
    }
  `),

  GET_CERTIFICATIONS: parse(`
    query GetCertifications {
      certifications {
        dashedName
        superblock {
          dashedName
          blocks
          isCertification
        }
      }
    }
  `),

  GET_HEALTH: parse(`
    query GetHealth {
      _health {
        superblockCount
        blockCount
        challengeCount
        memoryUsageMB
      }
    }
  `)
};
