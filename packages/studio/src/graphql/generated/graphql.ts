/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

/**
 * Learning module within a superblock
 * Contains challenges, layout information, and pedagogical metadata
 */
export type Block = {
  /**
   * Pedagogical classification (optional)
   * Field name changed from blockType to blockLabel to match actual JSON data
   */
  blockLabel?: Maybe<BlockLabel>;
  /** UI layout type for this block */
  blockLayout: BlockLayout;
  /** Ordered list of challenges in this block */
  challengeOrder: Array<Challenge>;
  /** Unique identifier (e.g., 'basic-html') */
  dashedName: Scalars['String']['output'];
  /**
   * Disable infinite loop protection in preview (optional)
   * Used for challenges that need continuous execution
   */
  disableLoopProtectPreview?: Maybe<Scalars['Boolean']['output']>;
  /**
   * Disable infinite loop protection in tests (optional)
   * Used for performance-intensive challenges like algorithms
   */
  disableLoopProtectTests?: Maybe<Scalars['Boolean']['output']>;
  /** Flag indicating editable region boundaries feature */
  hasEditableBoundaries?: Maybe<Scalars['Boolean']['output']>;
  /** Category for help/support (e.g., 'HTML-CSS') */
  helpCategory: Scalars['String']['output'];
  /** Flag indicating work-in-progress module */
  isUpcomingChange: Scalars['Boolean']['output'];
  /** Human-readable name (e.g., 'Basic HTML') */
  name: Scalars['String']['output'];
  /**
   * External resources required for challenges (optional)
   * CDN scripts for libraries like React, jQuery, D3, Bootstrap
   */
  required?: Maybe<Array<RequiredResource>>;
  /**
   * Parent superblocks (reverse reference for bidirectional navigation)
   * Note: In v9 curriculum, blocks can be shared across multiple superblocks
   */
  superblocks: Array<Superblock>;
  /**
   * HTML template for challenge rendering (optional)
   * Contains placeholders for dynamic content injection
   */
  template?: Maybe<Scalars['String']['output']>;
  /** Flag indicating multi-file editor feature */
  usesMultifileEditor?: Maybe<Scalars['Boolean']['output']>;
};

/**
 * Pedagogical classification for blocks
 * Describes the learning approach or activity type
 * Renamed from BlockType to BlockLabel to match actual JSON data
 */
export type BlockLabel =
  /** Formal assessment block */
  | 'EXAM'
  /** Hands-on practice block */
  | 'LAB'
  /** General learning block */
  | 'LEARN'
  /** Instructional content block */
  | 'LECTURE'
  /** Skill reinforcement block */
  | 'PRACTICE'
  /** Knowledge check block */
  | 'QUIZ'
  /** Concept review block */
  | 'REVIEW'
  /** Preparatory exercises block */
  | 'WARM_UP'
  /** Project-based learning block */
  | 'WORKSHOP';

/**
 * UI layout types for blocks
 * Determines how challenges are displayed in the frontend
 */
export type BlockLayout =
  /** Grid layout of challenges */
  | 'CHALLENGE_GRID'
  /** Vertical list of challenges */
  | 'CHALLENGE_LIST'
  /** Interactive dialogue-based layout */
  | 'DIALOGUE_GRID'
  /** Legacy grid layout */
  | 'LEGACY_CHALLENGE_GRID'
  /** Legacy vertical list layout */
  | 'LEGACY_CHALLENGE_LIST'
  /** Legacy link-based layout */
  | 'LEGACY_LINK'
  /** Link-based navigation layout */
  | 'LINK'
  /** Project-focused list layout */
  | 'PROJECT_LIST';

/**
 * Certification wrapper around superblock
 * Distinguishes certification-eligible curricula
 */
export type Certification = {
  /** Certification identifier (same as superblock dashedName) */
  dashedName: Scalars['String']['output'];
  /** Reference to underlying superblock */
  superblock: Superblock;
};

/**
 * Individual coding challenge
 * Metadata always available, content lazy-loaded in future v2
 */
export type Challenge = {
  /** Parent block (reverse reference for bidirectional navigation) */
  block: Block;
  /**
   * Full challenge content - MVP returns null
   * Future v2: Lazy-loaded from database with LRU cache
   * Enables v2 migration without breaking changes
   */
  content?: Maybe<ChallengeContent>;
  /** Unique UUID identifier */
  id: Scalars['ID']['output'];
  /** Challenge title */
  title: Scalars['String']['output'];
};

/**
 * Full challenge content (future v2, returns null in MVP)
 * Includes description, instructions, starter code, tests, and solutions
 */
export type ChallengeContent = {
  /** Challenge overview/description */
  description: Scalars['String']['output'];
  /** Starter code files */
  files: Array<ChallengeFile>;
  /** Step-by-step instructions */
  instructions: Scalars['String']['output'];
  /** Example solutions */
  solutions: Array<Solution>;
  /** Validation tests */
  tests: Array<Test>;
};

/**
 * Code file within a challenge or solution
 * Contains file metadata and content
 */
export type ChallengeFile = {
  /** File content as string */
  contents: Scalars['String']['output'];
  /** Line numbers defining editable regions (optional) */
  editableRegionBoundaries?: Maybe<Array<Scalars['Int']['output']>>;
  /** File extension (e.g., 'html') */
  ext: Scalars['String']['output'];
  /** File name (e.g., 'index.html') */
  name: Scalars['String']['output'];
};

/**
 * Chapter within a superblock (new v9 curriculum)
 * Groups related modules together
 */
export type Chapter = {
  /** Flag indicating if chapter is coming soon (not yet available) */
  comingSoon: Scalars['Boolean']['output'];
  /** Unique identifier for the chapter (e.g., 'html', 'javascript') */
  dashedName: Scalars['String']['output'];
  /** Modules within this chapter */
  modules: Array<Module>;
  /** Parent superblock (reverse reference for bidirectional navigation) */
  superblock: Superblock;
};

/**
 * Top-level curriculum structure
 * Contains lists of superblocks and certifications
 */
export type Curriculum = {
  /** Array of certification identifiers (subset of superblocks) */
  certifications: Array<Scalars['String']['output']>;
  /** Array of superblock identifiers (dashedNames) */
  superblocks: Array<Scalars['String']['output']>;
};

/** Curriculum data store metrics and memory usage */
export type DataStoreMetrics = {
  /** Number of loaded unique blocks (deduplicated) */
  blockCount: Scalars['Int']['output'];
  /** Number of loaded challenge metadata entries */
  challengeCount: Scalars['Int']['output'];
  /** Number of loaded chapters (v9 curriculum primitive) */
  chapterCount: Scalars['Int']['output'];
  /** Current heap memory usage in megabytes */
  memoryUsageMB: Scalars['Float']['output'];
  /** Number of loaded modules (v9 curriculum primitive) */
  moduleCount: Scalars['Int']['output'];
  /** Number of loaded superblocks */
  superblockCount: Scalars['Int']['output'];
};

/** Server health and operational metrics */
export type HealthCheck = {
  /** Curriculum data store statistics */
  dataStore: DataStoreMetrics;
  /** Current server health status (always 'healthy' in MVP) */
  status: Scalars['String']['output'];
  /** Uptime in seconds since server became operational */
  uptime: Scalars['Int']['output'];
};

/**
 * Module within a chapter (new v9 curriculum)
 * Contains a set of related blocks
 */
export type Module = {
  /** Resolved Block objects (convenience field) */
  blockObjects: Array<Block>;
  /** Array of block identifiers in this module */
  blocks: Array<Scalars['String']['output']>;
  /** Parent chapter (reverse reference for bidirectional navigation) */
  chapter: Chapter;
  /** Flag indicating if module is coming soon (not yet available) */
  comingSoon: Scalars['Boolean']['output'];
  /** Unique identifier for the module (e.g., 'basic-html', 'semantic-html') */
  dashedName: Scalars['String']['output'];
  /** Type of module (e.g., 'review', 'practice') - optional */
  moduleType?: Maybe<Scalars['String']['output']>;
};

/**
 * freeCodeCamp Curriculum GraphQL API Schema
 * Sprint 004 - Schema Definition and Code Generation
 *
 * This schema defines the complete API contract for curriculum metadata queries.
 * All types map to internal TypeScript types via @graphql-codegen type mappers.
 *
 * Metadata/Content Separation:
 * - Challenge metadata (id, title) always available
 * - Challenge content (description, instructions, tests) returns null in MVP
 * - ChallengeContent types included for future v2 database integration
 *
 * Type Mappers (configured in codegen.ts):
 * - Curriculum → CurriculumData
 * - Superblock → SuperblockData
 * - Block → BlockData
 * - Challenge → ChallengeMetadata (NOT full ChallengeData)
 * - BlockLayout → BlockLayout enum
 * - BlockType → BlockType enum
 */
export type Query = {
  /**
   * Server health check query
   * Returns current operational status and data store metrics
   * Useful for monitoring dashboards and load balancers
   */
  _health: HealthCheck;
  /** Get single block by identifier */
  block?: Maybe<Block>;
  /** Get all blocks, optionally filtered by superblock */
  blocks: Array<Block>;
  /** Get all certification-eligible superblocks */
  certifications: Array<Certification>;
  /** Get single challenge by ID */
  challenge?: Maybe<Challenge>;
  /** Get all challenges, optionally filtered by block */
  challenges: Array<Challenge>;
  /**
   * Get all chapters, optionally filtered by superblock (v9 curriculum)
   * Returns empty array for legacy flat curriculum superblocks
   */
  chapters: Array<Chapter>;
  /** Get complete curriculum structure */
  curriculum: Curriculum;
  /**
   * Get all modules, optionally filtered by chapter or superblock (v9 curriculum)
   * Returns empty array for legacy flat curriculum superblocks
   */
  modules: Array<Module>;
  /** Get single superblock by identifier */
  superblock?: Maybe<Superblock>;
  /** Get all superblocks */
  superblocks: Array<Superblock>;
};

/**
 * freeCodeCamp Curriculum GraphQL API Schema
 * Sprint 004 - Schema Definition and Code Generation
 *
 * This schema defines the complete API contract for curriculum metadata queries.
 * All types map to internal TypeScript types via @graphql-codegen type mappers.
 *
 * Metadata/Content Separation:
 * - Challenge metadata (id, title) always available
 * - Challenge content (description, instructions, tests) returns null in MVP
 * - ChallengeContent types included for future v2 database integration
 *
 * Type Mappers (configured in codegen.ts):
 * - Curriculum → CurriculumData
 * - Superblock → SuperblockData
 * - Block → BlockData
 * - Challenge → ChallengeMetadata (NOT full ChallengeData)
 * - BlockLayout → BlockLayout enum
 * - BlockType → BlockType enum
 */
export type QueryBlockArgs = {
  dashedName: Scalars['String']['input'];
};

/**
 * freeCodeCamp Curriculum GraphQL API Schema
 * Sprint 004 - Schema Definition and Code Generation
 *
 * This schema defines the complete API contract for curriculum metadata queries.
 * All types map to internal TypeScript types via @graphql-codegen type mappers.
 *
 * Metadata/Content Separation:
 * - Challenge metadata (id, title) always available
 * - Challenge content (description, instructions, tests) returns null in MVP
 * - ChallengeContent types included for future v2 database integration
 *
 * Type Mappers (configured in codegen.ts):
 * - Curriculum → CurriculumData
 * - Superblock → SuperblockData
 * - Block → BlockData
 * - Challenge → ChallengeMetadata (NOT full ChallengeData)
 * - BlockLayout → BlockLayout enum
 * - BlockType → BlockType enum
 */
export type QueryBlocksArgs = {
  superblockDashedName?: InputMaybe<Scalars['String']['input']>;
};

/**
 * freeCodeCamp Curriculum GraphQL API Schema
 * Sprint 004 - Schema Definition and Code Generation
 *
 * This schema defines the complete API contract for curriculum metadata queries.
 * All types map to internal TypeScript types via @graphql-codegen type mappers.
 *
 * Metadata/Content Separation:
 * - Challenge metadata (id, title) always available
 * - Challenge content (description, instructions, tests) returns null in MVP
 * - ChallengeContent types included for future v2 database integration
 *
 * Type Mappers (configured in codegen.ts):
 * - Curriculum → CurriculumData
 * - Superblock → SuperblockData
 * - Block → BlockData
 * - Challenge → ChallengeMetadata (NOT full ChallengeData)
 * - BlockLayout → BlockLayout enum
 * - BlockType → BlockType enum
 */
export type QueryChallengeArgs = {
  id: Scalars['ID']['input'];
};

/**
 * freeCodeCamp Curriculum GraphQL API Schema
 * Sprint 004 - Schema Definition and Code Generation
 *
 * This schema defines the complete API contract for curriculum metadata queries.
 * All types map to internal TypeScript types via @graphql-codegen type mappers.
 *
 * Metadata/Content Separation:
 * - Challenge metadata (id, title) always available
 * - Challenge content (description, instructions, tests) returns null in MVP
 * - ChallengeContent types included for future v2 database integration
 *
 * Type Mappers (configured in codegen.ts):
 * - Curriculum → CurriculumData
 * - Superblock → SuperblockData
 * - Block → BlockData
 * - Challenge → ChallengeMetadata (NOT full ChallengeData)
 * - BlockLayout → BlockLayout enum
 * - BlockType → BlockType enum
 */
export type QueryChallengesArgs = {
  blockDashedName?: InputMaybe<Scalars['String']['input']>;
};

/**
 * freeCodeCamp Curriculum GraphQL API Schema
 * Sprint 004 - Schema Definition and Code Generation
 *
 * This schema defines the complete API contract for curriculum metadata queries.
 * All types map to internal TypeScript types via @graphql-codegen type mappers.
 *
 * Metadata/Content Separation:
 * - Challenge metadata (id, title) always available
 * - Challenge content (description, instructions, tests) returns null in MVP
 * - ChallengeContent types included for future v2 database integration
 *
 * Type Mappers (configured in codegen.ts):
 * - Curriculum → CurriculumData
 * - Superblock → SuperblockData
 * - Block → BlockData
 * - Challenge → ChallengeMetadata (NOT full ChallengeData)
 * - BlockLayout → BlockLayout enum
 * - BlockType → BlockType enum
 */
export type QueryChaptersArgs = {
  superblockDashedName?: InputMaybe<Scalars['String']['input']>;
};

/**
 * freeCodeCamp Curriculum GraphQL API Schema
 * Sprint 004 - Schema Definition and Code Generation
 *
 * This schema defines the complete API contract for curriculum metadata queries.
 * All types map to internal TypeScript types via @graphql-codegen type mappers.
 *
 * Metadata/Content Separation:
 * - Challenge metadata (id, title) always available
 * - Challenge content (description, instructions, tests) returns null in MVP
 * - ChallengeContent types included for future v2 database integration
 *
 * Type Mappers (configured in codegen.ts):
 * - Curriculum → CurriculumData
 * - Superblock → SuperblockData
 * - Block → BlockData
 * - Challenge → ChallengeMetadata (NOT full ChallengeData)
 * - BlockLayout → BlockLayout enum
 * - BlockType → BlockType enum
 */
export type QueryModulesArgs = {
  chapterDashedName?: InputMaybe<Scalars['String']['input']>;
  superblockDashedName?: InputMaybe<Scalars['String']['input']>;
};

/**
 * freeCodeCamp Curriculum GraphQL API Schema
 * Sprint 004 - Schema Definition and Code Generation
 *
 * This schema defines the complete API contract for curriculum metadata queries.
 * All types map to internal TypeScript types via @graphql-codegen type mappers.
 *
 * Metadata/Content Separation:
 * - Challenge metadata (id, title) always available
 * - Challenge content (description, instructions, tests) returns null in MVP
 * - ChallengeContent types included for future v2 database integration
 *
 * Type Mappers (configured in codegen.ts):
 * - Curriculum → CurriculumData
 * - Superblock → SuperblockData
 * - Block → BlockData
 * - Challenge → ChallengeMetadata (NOT full ChallengeData)
 * - BlockLayout → BlockLayout enum
 * - BlockType → BlockType enum
 */
export type QuerySuperblockArgs = {
  dashedName: Scalars['String']['input'];
};

/**
 * External resource (CDN script or stylesheet) required for challenges
 * Used in blocks that depend on external libraries
 */
export type RequiredResource = {
  /**
   * CDN URL for CSS stylesheet (optional)
   * Note: Either src or link must be present
   */
  link?: Maybe<Scalars['String']['output']>;
  /** CDN URL for JavaScript library (optional) */
  src?: Maybe<Scalars['String']['output']>;
};

/**
 * Example solution for a challenge
 * Contains solution code files
 */
export type Solution = {
  /** Solution code files */
  files: Array<ChallengeFile>;
};

/**
 * Major curriculum area (e.g., Responsive Web Design)
 * Supports both legacy (flat) and new v9 (hierarchical) curriculum structures
 */
export type Superblock = {
  /** Resolved Block objects - flattened view (convenience field) */
  blockObjects: Array<Block>;
  /** Flattened array of all block identifiers (from all chapters/modules) */
  blocks: Array<Scalars['String']['output']>;
  /**
   * Hierarchical chapter structure (new v9 curriculum)
   * Empty array for legacy flat curriculum
   */
  chapters: Array<Chapter>;
  /** Unique identifier (e.g., 'responsive-web-design') */
  dashedName: Scalars['String']['output'];
  /** True if this superblock is certification-eligible */
  isCertification: Scalars['Boolean']['output'];
  /** Human-readable name (e.g., 'Responsive Web Design') */
  name: Scalars['String']['output'];
};

/**
 * Validation test for challenge submission
 * Contains human-readable description and assertion code
 */
export type Test = {
  /** Test assertion code */
  testString: Scalars['String']['output'];
  /** Human-readable test description */
  text: Scalars['String']['output'];
};

export type SuperblocksQueryVariables = Exact<{ [key: string]: never }>;

export type SuperblocksQuery = {
  superblocks: Array<{
    name: string;
    dashedName: string;
    isCertification: boolean;
  }>;
};

export type SidebarNavQueryVariables = Exact<{ [key: string]: never }>;

export type SidebarNavQuery = {
  curriculum: { superblocks: Array<string>; certifications: Array<string> };
  superblocks: Array<{
    name: string;
    dashedName: string;
    isCertification: boolean;
    chapters: Array<{
      dashedName: string;
      modules: Array<{ dashedName: string; blocks: Array<string> }>;
    }>;
  }>;
};

export type CurriculumOverviewQueryVariables = Exact<{ [key: string]: never }>;

export type CurriculumOverviewQuery = {
  curriculum: { superblocks: Array<string>; certifications: Array<string> };
  superblocks: Array<{
    name: string;
    dashedName: string;
    isCertification: boolean;
    blocks: Array<string>;
  }>;
  certifications: Array<{ dashedName: string }>;
};

export type SuperblockDetailQueryVariables = Exact<{
  dashedName: Scalars['String']['input'];
}>;

export type SuperblockDetailQuery = {
  superblock?: {
    name: string;
    dashedName: string;
    isCertification: boolean;
    blocks: Array<string>;
    blockObjects: Array<{
      name: string;
      dashedName: string;
      helpCategory: string;
      blockLayout: BlockLayout;
      blockLabel?: BlockLabel | null;
      isUpcomingChange: boolean;
    }>;
  } | null;
};

export type ModuleDetailQueryVariables = Exact<{
  superblockDashedName?: InputMaybe<Scalars['String']['input']>;
  chapterDashedName?: InputMaybe<Scalars['String']['input']>;
}>;

export type ModuleDetailQuery = {
  modules: Array<{
    dashedName: string;
    moduleType?: string | null;
    comingSoon: boolean;
    blocks: Array<string>;
    blockObjects: Array<{
      name: string;
      dashedName: string;
      helpCategory: string;
      blockLayout: BlockLayout;
      blockLabel?: BlockLabel | null;
      isUpcomingChange: boolean;
    }>;
    chapter: {
      dashedName: string;
      superblock: {
        name: string;
        dashedName: string;
        isCertification: boolean;
      };
    };
  }>;
};

export type BlockDetailQueryVariables = Exact<{
  dashedName: Scalars['String']['input'];
}>;

export type BlockDetailQuery = {
  block?: {
    name: string;
    dashedName: string;
    helpCategory: string;
    blockLayout: BlockLayout;
    blockLabel?: BlockLabel | null;
    isUpcomingChange: boolean;
    usesMultifileEditor?: boolean | null;
    hasEditableBoundaries?: boolean | null;
    challengeOrder: Array<{ id: string; title: string }>;
    superblocks: Array<{ name: string; dashedName: string }>;
  } | null;
};

export type ChallengeDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type ChallengeDetailQuery = {
  challenge?: {
    id: string;
    title: string;
    block: { name: string; dashedName: string };
    content?: {
      description: string;
      instructions: string;
      files: Array<{ name: string; ext: string }>;
      tests: Array<{ text: string }>;
      solutions: Array<{ files: Array<{ name: string; ext: string }> }>;
    } | null;
  } | null;
};

export const SuperblocksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Superblocks' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'superblocks' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dashedName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'isCertification' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SuperblocksQuery, SuperblocksQueryVariables>;
export const SidebarNavDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SidebarNav' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'curriculum' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'superblocks' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'certifications' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'superblocks' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dashedName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'isCertification' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'chapters' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dashedName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'modules' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'dashedName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'blocks' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SidebarNavQuery, SidebarNavQueryVariables>;
export const CurriculumOverviewDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'CurriculumOverview' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'curriculum' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'superblocks' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'certifications' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'superblocks' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dashedName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'isCertification' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'blocks' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'certifications' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'dashedName' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CurriculumOverviewQuery,
  CurriculumOverviewQueryVariables
>;
export const SuperblockDetailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SuperblockDetail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'dashedName' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'superblock' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'dashedName' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'dashedName' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dashedName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'isCertification' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'blocks' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'blockObjects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dashedName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'helpCategory' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'blockLayout' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'blockLabel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'isUpcomingChange' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SuperblockDetailQuery,
  SuperblockDetailQueryVariables
>;
export const ModuleDetailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ModuleDetail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'superblockDashedName' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'chapterDashedName' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'modules' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'superblockDashedName' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'superblockDashedName' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'chapterDashedName' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'chapterDashedName' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'dashedName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'moduleType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'comingSoon' } },
                { kind: 'Field', name: { kind: 'Name', value: 'blocks' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'blockObjects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dashedName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'helpCategory' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'blockLayout' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'blockLabel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'isUpcomingChange' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'chapter' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dashedName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'superblock' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'dashedName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'isCertification' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ModuleDetailQuery, ModuleDetailQueryVariables>;
export const BlockDetailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'BlockDetail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'dashedName' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'block' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'dashedName' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'dashedName' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dashedName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'helpCategory' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'blockLayout' } },
                { kind: 'Field', name: { kind: 'Name', value: 'blockLabel' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'isUpcomingChange' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'usesMultifileEditor' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hasEditableBoundaries' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'challengeOrder' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'superblocks' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dashedName' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BlockDetailQuery, BlockDetailQueryVariables>;
export const ChallengeDetailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ChallengeDetail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'challenge' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'block' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dashedName' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'content' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'instructions' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'files' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'ext' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'tests' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'text' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'solutions' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'files' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'ext' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ChallengeDetailQuery,
  ChallengeDetailQueryVariables
>;
