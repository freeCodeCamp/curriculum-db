import { describe, it, expect, beforeAll } from 'vitest';
import { parse } from 'graphql';
import type { GraphQLExecutor } from './setup.js';
import { createTestExecutor, getTestDataStore } from './setup.js';
import { KNOWN_TEST_DATA } from './fixtures.js';
import { expectValidGraphQLResponse, expectNullableField } from './helpers.js';
import type {
  BlockQueryResponse,
  ChallengeQueryResponse,
  ChallengesQueryResponse,
  HealthCheckQueryResponse,
} from './typed-helpers.js';

// Introspection query response types
type IntrospectionTypeResponse = {
  __type: {
    name: string;
    kind: string;
    fields: Array<{
      name: string;
      type: {
        name: string | null;
        kind: string;
        ofType?: {
          name: string | null;
          kind: string;
        } | null;
      };
    }>;
  };
};

let executor: GraphQLExecutor;

beforeAll(async () => {
  executor = await createTestExecutor();
});

describe('Content Separation Validation (US3)', () => {
  describe('Challenge.content field', () => {
    it('should return null for Challenge.content in MVP', async () => {
      // Get a valid challenge ID
      const blockResult = await executor.execute<BlockQueryResponse>({
        document: parse(`
          query GetBlock($dashedName: String!) {
            block(dashedName: $dashedName) {
              challengeOrder {
                id
              }
            }
          }
        `),
        variables: { dashedName: KNOWN_TEST_DATA.validBlock },
      });

      expectValidGraphQLResponse(blockResult);
      const challengeId = blockResult.data.block?.challengeOrder?.[0]?.id;

      // Query for challenge with content field
      const result = await executor.execute<ChallengeQueryResponse>({
        document: parse(`
          query GetChallengeWithContent($id: ID!) {
            challenge(id: $id) {
              id
              title
              content {
                description
                instructions
              }
            }
          }
        `),
        variables: { id: challengeId },
      });

      expectValidGraphQLResponse(result);

      const challenge = result.data.challenge;
      expect(challenge?.id).toBe(challengeId);
      expect(challenge?.title).toBeDefined();

      // Content must be null in MVP (architectural requirement)
      expectNullableField(challenge?.content, { expectNull: true });
    });

    it('should return null for content across multiple challenges', async () => {
      // Get multiple challenges
      const result = await executor.execute<ChallengesQueryResponse>({
        document: parse(`
          query GetChallengesWithContent($blockDashedName: String!) {
            challenges(blockDashedName: $blockDashedName) {
              id
              title
              content {
                description
              }
            }
          }
        `),
        variables: { blockDashedName: KNOWN_TEST_DATA.validBlock },
      });

      expectValidGraphQLResponse(result);

      expect(result.data.challenges.length).toBeGreaterThan(0);

      // All challenges must have null content
      for (const challenge of result.data.challenges) {
        expectNullableField(challenge.content, { expectNull: true });
      }
    });
  });

  describe('Metadata-only validation', () => {
    it('should load only metadata fields (id, title) in DataStore', async () => {
      const store = await getTestDataStore();

      // Verify challenges have only metadata, not content
      for (const challenge of store.challenges.values()) {
        // Metadata fields must exist
        expect(challenge.id).toBeDefined();
        expect(typeof challenge.id).toBe('string');
        expect(challenge.title).toBeDefined();
        expect(typeof challenge.title).toBe('string');

        // blockDashedName is part of metadata (for relationships)
        expect(challenge.blockDashedName).toBeDefined();
        expect(typeof challenge.blockDashedName).toBe('string');

        // Content fields should not exist on ChallengeMetadata
        // TypeScript enforces this, but verify at runtime
        expect('description' in challenge).toBe(false);
        expect('instructions' in challenge).toBe(false);
        expect('files' in challenge).toBe(false);
        expect('tests' in challenge).toBe(false);
        expect('solutions' in challenge).toBe(false);
      }
    });

    it('should verify memory usage stays under 50MB threshold', async () => {
      const result = await executor.execute<HealthCheckQueryResponse>({
        document: parse(`
          query GetHealth {
            _health {
              dataStore {
                memoryUsageMB
                superblockCount
                blockCount
                challengeCount
              }
            }
          }
        `),
      });

      expectValidGraphQLResponse(result);

      const health = result.data._health;

      // Verify metadata-only storage keeps memory low
      expect(health.dataStore.memoryUsageMB).toBeLessThan(50);

      // Log stats for visibility
      console.log('Memory usage validation:');
      console.log(`  - ${health.dataStore.superblockCount} superblocks`);
      console.log(`  - ${health.dataStore.blockCount} blocks`);
      console.log(`  - ${health.dataStore.challengeCount} challenges`);
      console.log(`  - ${health.dataStore.memoryUsageMB} MB memory`);
      console.log(`  ✓ Under 50MB threshold (metadata-only)`);
    });
  });

  describe('Future-ready schema', () => {
    it('should have ChallengeContent type defined in schema for v2', async () => {
      // Query the schema introspection to verify ChallengeContent exists
      const result = await executor.execute<IntrospectionTypeResponse>({
        document: parse(`
          query IntrospectChallengeContent {
            __type(name: "ChallengeContent") {
              name
              kind
              fields {
                name
                type {
                  name
                  kind
                }
              }
            }
          }
        `),
      });

      expectValidGraphQLResponse(result);

      const contentType = result.data.__type;
      expect(contentType).toBeDefined();
      expect(contentType.name).toBe('ChallengeContent');
      expect(contentType.kind).toBe('OBJECT');

      // Verify expected fields exist
      const fieldNames = contentType.fields.map((f) => f.name);
      expect(fieldNames).toContain('description');
      expect(fieldNames).toContain('instructions');
    });

    it('should make Challenge.content nullable in schema', async () => {
      // Introspect Challenge type to verify content is nullable
      const result = await executor.execute<IntrospectionTypeResponse>({
        document: parse(`
          query IntrospectChallenge {
            __type(name: "Challenge") {
              name
              fields {
                name
                type {
                  kind
                  name
                  ofType {
                    name
                    kind
                  }
                }
              }
            }
          }
        `),
      });

      expectValidGraphQLResponse(result);

      const challengeType = result.data.__type;
      const contentField = challengeType.fields.find(
        (f) => f.name === 'content'
      );

      expect(contentField).toBeDefined();

      // Content field should be nullable (kind is not NON_NULL)
      expect(contentField?.type.kind).not.toBe('NON_NULL');
      expect(contentField?.type.name).toBe('ChallengeContent');
    });
  });
});
