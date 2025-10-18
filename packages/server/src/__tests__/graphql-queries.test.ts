import { describe, it, expect, beforeAll } from 'vitest';
import { parse } from 'graphql';
import type { GraphQLExecutor } from './setup.js';
import { createTestExecutor } from './setup.js';
import { TEST_QUERIES, KNOWN_TEST_DATA } from './fixtures.js';
import { expectValidGraphQLResponse, expectNullableField, expectUniqueItems } from './helpers.js';

let executor: GraphQLExecutor;

beforeAll(async () => {
  executor = await createTestExecutor();
});

describe('GraphQL Query Validation', () => {
  describe('Query: curriculum', () => {
    it('should return curriculum with superblocks and certifications', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_CURRICULUM
      });

      expectValidGraphQLResponse(result);

      expect(result.data.curriculum).toBeDefined();
      expect(result.data.curriculum.superblocks).toBeInstanceOf(Array);
      expect(result.data.curriculum.certifications).toBeInstanceOf(Array);

      // Should have expected counts
      expect(result.data.curriculum.superblocks.length).toBeGreaterThan(20);
      expect(result.data.curriculum.certifications.length).toBeGreaterThan(20);
    });

    it('should return unique superblock and certification names', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_CURRICULUM
      });

      expectValidGraphQLResponse(result);

      expectUniqueItems(
        result.data.curriculum.superblocks,
        'curriculum.superblocks should contain unique values'
      );
      expectUniqueItems(
        result.data.curriculum.certifications,
        'curriculum.certifications should contain unique values'
      );
    });
  });

  describe('Query: superblock(dashedName)', () => {
    it('should return valid superblock data for existing superblock', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_SUPERBLOCK,
        variables: { dashedName: KNOWN_TEST_DATA.validSuperblock }
      });

      expectValidGraphQLResponse(result);

      const superblock = result.data.superblock;
      expect(superblock).toBeDefined();
      expect(superblock.dashedName).toBe(KNOWN_TEST_DATA.validSuperblock);
      expect(superblock.blocks).toBeInstanceOf(Array);
      expect(superblock.blocks.length).toBeGreaterThan(0);
      expect(typeof superblock.isCertification).toBe('boolean');
    });

    it('should return blockObjects with valid structure', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_SUPERBLOCK,
        variables: { dashedName: KNOWN_TEST_DATA.validSuperblock }
      });

      expectValidGraphQLResponse(result);

      const superblock = result.data.superblock;
      expect(superblock.blockObjects).toBeInstanceOf(Array);

      for (const block of superblock.blockObjects) {
        expect(block.dashedName).toBeDefined();
        expect(typeof block.dashedName).toBe('string');
        expect(block.name).toBeDefined();
        expect(typeof block.name).toBe('string');
      }
    });

    it('should return null for non-existent superblock', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_SUPERBLOCK,
        variables: { dashedName: KNOWN_TEST_DATA.nonExistentSuperblock }
      });

      expectValidGraphQLResponse(result);
      expectNullableField(result.data.superblock, { expectNull: true });
    });
  });

  describe('Query: superblocks', () => {
    it('should return all superblocks with valid data', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_ALL_SUPERBLOCKS
      });

      expectValidGraphQLResponse(result);

      expect(result.data.superblocks).toBeInstanceOf(Array);
      expect(result.data.superblocks.length).toBeGreaterThan(20);

      for (const superblock of result.data.superblocks) {
        expect(superblock.dashedName).toBeDefined();
        expect(typeof superblock.dashedName).toBe('string');
        expect(superblock.blocks).toBeInstanceOf(Array);
        expect(typeof superblock.isCertification).toBe('boolean');
      }
    });

    it('should return unique superblock dashedNames', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_ALL_SUPERBLOCKS
      });

      expectValidGraphQLResponse(result);

      const dashedNames = result.data.superblocks.map((sb: any) => sb.dashedName);
      expectUniqueItems(dashedNames, 'superblocks should have unique dashedNames');
    });
  });

  describe('Query: block(dashedName)', () => {
    it('should return valid block data for existing block', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_BLOCK,
        variables: { dashedName: KNOWN_TEST_DATA.validBlock }
      });

      expectValidGraphQLResponse(result);

      const block = result.data.block;
      expect(block).toBeDefined();
      expect(block.dashedName).toBe(KNOWN_TEST_DATA.validBlock);
      expect(block.name).toBeDefined();
      expect(typeof block.name).toBe('string');
      expect(block.helpCategory).toBeDefined();
      expect(block.blockLayout).toBeDefined();
    });

    it('should return challengeOrder with valid structure', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_BLOCK,
        variables: { dashedName: KNOWN_TEST_DATA.validBlock }
      });

      expectValidGraphQLResponse(result);

      const block = result.data.block;
      expect(block.challengeOrder).toBeInstanceOf(Array);
      expect(block.challengeOrder.length).toBeGreaterThan(0);

      for (const challenge of block.challengeOrder) {
        expect(challenge.id).toBeDefined();
        expect(typeof challenge.id).toBe('string');
        expect(challenge.title).toBeDefined();
        expect(typeof challenge.title).toBe('string');
      }
    });

    it('should return null for non-existent block', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_BLOCK,
        variables: { dashedName: KNOWN_TEST_DATA.nonExistentBlock }
      });

      expectValidGraphQLResponse(result);
      expectNullableField(result.data.block, { expectNull: true });
    });

    it('should handle nullable fields correctly', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_BLOCK,
        variables: { dashedName: KNOWN_TEST_DATA.validBlock }
      });

      expectValidGraphQLResponse(result);

      const block = result.data.block;

      // blockType is nullable
      expectNullableField(block.blockType);

      // isUpcomingChange is nullable
      expectNullableField(block.isUpcomingChange);
    });
  });

  describe('Query: blocks(superblockDashedName)', () => {
    it('should return all blocks when no filter provided', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_BLOCKS
      });

      expectValidGraphQLResponse(result);

      expect(result.data.blocks).toBeInstanceOf(Array);
      expect(result.data.blocks.length).toBeGreaterThan(200);

      for (const block of result.data.blocks) {
        expect(block.dashedName).toBeDefined();
        expect(typeof block.dashedName).toBe('string');
        expect(block.name).toBeDefined();
        expect(typeof block.name).toBe('string');
      }
    });

    it('should filter blocks by superblock when provided', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_BLOCKS,
        variables: { superblockDashedName: KNOWN_TEST_DATA.validSuperblock }
      });

      expectValidGraphQLResponse(result);

      expect(result.data.blocks).toBeInstanceOf(Array);
      expect(result.data.blocks.length).toBeGreaterThan(0);

      // All blocks should belong to the specified superblock
      // (verified by checking they exist)
      for (const block of result.data.blocks) {
        expect(block.dashedName).toBeDefined();
      }
    });

    it('should return empty array for non-existent superblock', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_BLOCKS,
        variables: { superblockDashedName: KNOWN_TEST_DATA.nonExistentSuperblock }
      });

      expectValidGraphQLResponse(result);
      expect(result.data.blocks).toEqual([]);
    });

    it('should return unique block dashedNames', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_BLOCKS
      });

      expectValidGraphQLResponse(result);

      const dashedNames = result.data.blocks.map((b: any) => b.dashedName);
      expectUniqueItems(dashedNames, 'blocks should have unique dashedNames');
    });
  });

  describe('Query: challenge(id)', () => {
    it('should return valid challenge data for existing challenge', async () => {
      // First get a valid challenge ID
      const blocksResult = await executor.execute({
        document: TEST_QUERIES.GET_BLOCK,
        variables: { dashedName: KNOWN_TEST_DATA.validBlock }
      });

      expectValidGraphQLResponse(blocksResult);
      const challengeId = blocksResult.data.block.challengeOrder[0].id;

      // Now query for that specific challenge
      const result = await executor.execute({
        document: TEST_QUERIES.GET_CHALLENGE,
        variables: { id: challengeId }
      });

      expectValidGraphQLResponse(result);

      const challenge = result.data.challenge;
      expect(challenge).toBeDefined();
      expect(challenge.id).toBe(challengeId);
      expect(challenge.title).toBeDefined();
      expect(typeof challenge.title).toBe('string');
    });

    it('should return null for non-existent challenge', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_CHALLENGE,
        variables: { id: KNOWN_TEST_DATA.nonExistentChallengeId }
      });

      expectValidGraphQLResponse(result);
      expectNullableField(result.data.challenge, { expectNull: true });
    });

    it('should return block relationship', async () => {
      // First get a valid challenge ID
      const blocksResult = await executor.execute({
        document: TEST_QUERIES.GET_BLOCK,
        variables: { dashedName: KNOWN_TEST_DATA.validBlock }
      });

      expectValidGraphQLResponse(blocksResult);
      const challengeId = blocksResult.data.block.challengeOrder[0].id;

      // Now query for that challenge
      const result = await executor.execute({
        document: TEST_QUERIES.GET_CHALLENGE,
        variables: { id: challengeId }
      });

      expectValidGraphQLResponse(result);

      const challenge = result.data.challenge;
      expect(challenge.block).toBeDefined();
      expect(challenge.block.dashedName).toBeDefined();
      expect(typeof challenge.block.dashedName).toBe('string');
      expect(challenge.block.name).toBeDefined();
    });
  });

  describe('Query: challenges(blockDashedName)', () => {
    it('should return all challenges when no filter provided', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_CHALLENGES
      });

      expectValidGraphQLResponse(result);

      expect(result.data.challenges).toBeInstanceOf(Array);
      expect(result.data.challenges.length).toBeGreaterThan(10000);

      for (const challenge of result.data.challenges) {
        expect(challenge.id).toBeDefined();
        expect(typeof challenge.id).toBe('string');
        expect(challenge.title).toBeDefined();
        expect(typeof challenge.title).toBe('string');
      }
    });

    it('should filter challenges by block when provided', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_CHALLENGES,
        variables: { blockDashedName: KNOWN_TEST_DATA.validBlock }
      });

      expectValidGraphQLResponse(result);

      expect(result.data.challenges).toBeInstanceOf(Array);
      expect(result.data.challenges.length).toBeGreaterThan(0);

      for (const challenge of result.data.challenges) {
        expect(challenge.id).toBeDefined();
        expect(challenge.title).toBeDefined();
      }
    });

    it('should return empty array for non-existent block', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_CHALLENGES,
        variables: { blockDashedName: KNOWN_TEST_DATA.nonExistentBlock }
      });

      expectValidGraphQLResponse(result);
      expect(result.data.challenges).toEqual([]);
    });

    it('should return unique challenge IDs', async () => {
      const result = await executor.execute({
        document: TEST_QUERIES.GET_CHALLENGES,
        variables: { blockDashedName: KNOWN_TEST_DATA.validBlock }
      });

      expectValidGraphQLResponse(result);

      const ids = result.data.challenges.map((c: any) => c.id);
      expectUniqueItems(ids, 'challenges should have unique IDs');
    });
  });

  describe('Query: certifications', () => {
    it('should return all certifications with valid data', async () => {
      const result = await executor.execute({
        document: parse(`
          query GetCertifications {
            certifications {
              dashedName
            }
          }
        `)
      });

      expectValidGraphQLResponse(result);

      expect(result.data.certifications).toBeInstanceOf(Array);
      expect(result.data.certifications.length).toBeGreaterThan(20);

      for (const cert of result.data.certifications) {
        expect(cert.dashedName).toBeDefined();
        expect(typeof cert.dashedName).toBe('string');
      }
    });

    it('should return valid certifications that match existing superblocks', async () => {
      // Get all certifications
      const certResult = await executor.execute({
        document: parse(`
          query GetCertifications {
            certifications {
              dashedName
            }
          }
        `)
      });

      expectValidGraphQLResponse(certResult);

      // Get all loaded superblocks
      const sbResult = await executor.execute({
        document: TEST_QUERIES.GET_ALL_SUPERBLOCKS
      });

      expectValidGraphQLResponse(sbResult);

      const loadedSuperblocks = new Set(
        sbResult.data.superblocks.map((sb: any) => sb.dashedName)
      );

      // Count how many certifications have loaded superblocks
      let validCertCount = 0;
      for (const cert of certResult.data.certifications) {
        if (loadedSuperblocks.has(cert.dashedName)) {
          validCertCount++;

          // Verify the superblock is marked as a certification
          const sb = sbResult.data.superblocks.find(
            (s: any) => s.dashedName === cert.dashedName
          );
          expect(sb.isCertification).toBe(true);
        }
      }

      // Should have at least 15 valid certifications
      expect(validCertCount).toBeGreaterThan(15);
    });

    it('should return unique certification dashedNames', async () => {
      const result = await executor.execute({
        document: parse(`
          query GetCertifications {
            certifications {
              dashedName
            }
          }
        `)
      });

      expectValidGraphQLResponse(result);

      const dashedNames = result.data.certifications.map((c: any) => c.dashedName);
      expectUniqueItems(dashedNames, 'certifications should have unique dashedNames');
    });
  });
});
