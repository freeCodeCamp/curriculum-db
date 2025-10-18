import { BlockLayout } from '../data/types.js';
import { BlockType } from '../data/types.js';
import { GraphQLResolveInfo } from 'graphql';
import { CurriculumData, SuperblockData, BlockData, ChallengeMetadata, CertificationData, DataProvider } from '../data/types.js';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

/**
 * Learning module within a superblock
 * Contains challenges, layout information, and pedagogical metadata
 */
export type Block = {
  /** UI layout type for this block */
  blockLayout: BlockLayout;
  /** Pedagogical classification (optional) */
  blockType?: Maybe<BlockType>;
  /** Ordered list of challenges in this block */
  challengeOrder: Array<Challenge>;
  /** Unique identifier (e.g., 'basic-html') */
  dashedName: Scalars['String']['output'];
  /** Flag indicating editable region boundaries feature */
  hasEditableBoundaries?: Maybe<Scalars['Boolean']['output']>;
  /** Category for help/support (e.g., 'HTML-CSS') */
  helpCategory: Scalars['String']['output'];
  /** Flag indicating work-in-progress module */
  isUpcomingChange: Scalars['Boolean']['output'];
  /** Human-readable name (e.g., 'Basic HTML') */
  name: Scalars['String']['output'];
  /** Parent superblock (reverse reference for bidirectional navigation) */
  superblock: Superblock;
  /** Flag indicating multi-file editor feature */
  usesMultifileEditor?: Maybe<Scalars['Boolean']['output']>;
};

export { BlockLayout };

export { BlockType };

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
  /** Number of loaded blocks */
  blockCount: Scalars['Int']['output'];
  /** Number of loaded challenge metadata entries */
  challengeCount: Scalars['Int']['output'];
  /** Current heap memory usage in megabytes */
  memoryUsageMB: Scalars['Float']['output'];
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
  /** Get complete curriculum structure */
  curriculum: Curriculum;
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
  superblockDashedName: InputMaybe<Scalars['String']['input']>;
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
  blockDashedName: InputMaybe<Scalars['String']['input']>;
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
 * Example solution for a challenge
 * Contains solution code files
 */
export type Solution = {
  /** Solution code files */
  files: Array<ChallengeFile>;
};

/**
 * Major curriculum area (e.g., Responsive Web Design)
 * Contains blocks and certification status
 */
export type Superblock = {
  /** Resolved Block objects (convenience field for bidirectional navigation) */
  blockObjects: Array<Block>;
  /** Array of block identifiers */
  blocks: Array<Scalars['String']['output']>;
  /** Unique identifier (e.g., 'responsive-web-design') */
  dashedName: Scalars['String']['output'];
  /** True if this superblock is certification-eligible */
  isCertification: Scalars['Boolean']['output'];
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Block: ResolverTypeWrapper<BlockData>;
  BlockLayout: BlockLayout;
  BlockType: BlockType;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Certification: ResolverTypeWrapper<CertificationData>;
  Challenge: ResolverTypeWrapper<ChallengeMetadata>;
  ChallengeContent: ResolverTypeWrapper<ChallengeContent>;
  ChallengeFile: ResolverTypeWrapper<ChallengeFile>;
  Curriculum: ResolverTypeWrapper<CurriculumData>;
  DataStoreMetrics: ResolverTypeWrapper<DataStoreMetrics>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  HealthCheck: ResolverTypeWrapper<HealthCheck>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Solution: ResolverTypeWrapper<Solution>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Superblock: ResolverTypeWrapper<SuperblockData>;
  Test: ResolverTypeWrapper<Test>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Block: BlockData;
  Boolean: Scalars['Boolean']['output'];
  Certification: CertificationData;
  Challenge: ChallengeMetadata;
  ChallengeContent: ChallengeContent;
  ChallengeFile: ChallengeFile;
  Curriculum: CurriculumData;
  DataStoreMetrics: DataStoreMetrics;
  Float: Scalars['Float']['output'];
  HealthCheck: HealthCheck;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Query: Record<PropertyKey, never>;
  Solution: Solution;
  String: Scalars['String']['output'];
  Superblock: SuperblockData;
  Test: Test;
};

export type BlockResolvers<ContextType = DataProvider, ParentType extends ResolversParentTypes['Block'] = ResolversParentTypes['Block']> = {
  blockLayout?: Resolver<ResolversTypes['BlockLayout'], ParentType, ContextType>;
  blockType?: Resolver<Maybe<ResolversTypes['BlockType']>, ParentType, ContextType>;
  challengeOrder?: Resolver<Array<ResolversTypes['Challenge']>, ParentType, ContextType>;
  dashedName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasEditableBoundaries?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  helpCategory?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isUpcomingChange?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  superblock?: Resolver<ResolversTypes['Superblock'], ParentType, ContextType>;
  usesMultifileEditor?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
};

export type BlockLayoutResolvers = EnumResolverSignature<{ CHALLENGE_GRID?: any, CHALLENGE_LIST?: any, DIALOGUE_GRID?: any, LEGACY_CHALLENGE_GRID?: any, LEGACY_CHALLENGE_LIST?: any, LEGACY_LINK?: any, LINK?: any, PROJECT_LIST?: any }, ResolversTypes['BlockLayout']>;

export type BlockTypeResolvers = EnumResolverSignature<{ EXAM?: any, LAB?: any, LEARN?: any, LECTURE?: any, PRACTICE?: any, QUIZ?: any, REVIEW?: any, WARM_UP?: any, WORKSHOP?: any }, ResolversTypes['BlockType']>;

export type CertificationResolvers<ContextType = DataProvider, ParentType extends ResolversParentTypes['Certification'] = ResolversParentTypes['Certification']> = {
  dashedName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  superblock?: Resolver<ResolversTypes['Superblock'], ParentType, ContextType>;
};

export type ChallengeResolvers<ContextType = DataProvider, ParentType extends ResolversParentTypes['Challenge'] = ResolversParentTypes['Challenge']> = {
  block?: Resolver<ResolversTypes['Block'], ParentType, ContextType>;
  content?: Resolver<Maybe<ResolversTypes['ChallengeContent']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ChallengeContentResolvers<ContextType = DataProvider, ParentType extends ResolversParentTypes['ChallengeContent'] = ResolversParentTypes['ChallengeContent']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  files?: Resolver<Array<ResolversTypes['ChallengeFile']>, ParentType, ContextType>;
  instructions?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  solutions?: Resolver<Array<ResolversTypes['Solution']>, ParentType, ContextType>;
  tests?: Resolver<Array<ResolversTypes['Test']>, ParentType, ContextType>;
};

export type ChallengeFileResolvers<ContextType = DataProvider, ParentType extends ResolversParentTypes['ChallengeFile'] = ResolversParentTypes['ChallengeFile']> = {
  contents?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  editableRegionBoundaries?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  ext?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type CurriculumResolvers<ContextType = DataProvider, ParentType extends ResolversParentTypes['Curriculum'] = ResolversParentTypes['Curriculum']> = {
  certifications?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  superblocks?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
};

export type DataStoreMetricsResolvers<ContextType = DataProvider, ParentType extends ResolversParentTypes['DataStoreMetrics'] = ResolversParentTypes['DataStoreMetrics']> = {
  blockCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  challengeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  memoryUsageMB?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  superblockCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type HealthCheckResolvers<ContextType = DataProvider, ParentType extends ResolversParentTypes['HealthCheck'] = ResolversParentTypes['HealthCheck']> = {
  dataStore?: Resolver<ResolversTypes['DataStoreMetrics'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  uptime?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = DataProvider, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  _health?: Resolver<ResolversTypes['HealthCheck'], ParentType, ContextType>;
  block?: Resolver<Maybe<ResolversTypes['Block']>, ParentType, ContextType, RequireFields<QueryBlockArgs, 'dashedName'>>;
  blocks?: Resolver<Array<ResolversTypes['Block']>, ParentType, ContextType, Partial<QueryBlocksArgs>>;
  certifications?: Resolver<Array<ResolversTypes['Certification']>, ParentType, ContextType>;
  challenge?: Resolver<Maybe<ResolversTypes['Challenge']>, ParentType, ContextType, RequireFields<QueryChallengeArgs, 'id'>>;
  challenges?: Resolver<Array<ResolversTypes['Challenge']>, ParentType, ContextType, Partial<QueryChallengesArgs>>;
  curriculum?: Resolver<ResolversTypes['Curriculum'], ParentType, ContextType>;
  superblock?: Resolver<Maybe<ResolversTypes['Superblock']>, ParentType, ContextType, RequireFields<QuerySuperblockArgs, 'dashedName'>>;
  superblocks?: Resolver<Array<ResolversTypes['Superblock']>, ParentType, ContextType>;
};

export type SolutionResolvers<ContextType = DataProvider, ParentType extends ResolversParentTypes['Solution'] = ResolversParentTypes['Solution']> = {
  files?: Resolver<Array<ResolversTypes['ChallengeFile']>, ParentType, ContextType>;
};

export type SuperblockResolvers<ContextType = DataProvider, ParentType extends ResolversParentTypes['Superblock'] = ResolversParentTypes['Superblock']> = {
  blockObjects?: Resolver<Array<ResolversTypes['Block']>, ParentType, ContextType>;
  blocks?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  dashedName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isCertification?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type TestResolvers<ContextType = DataProvider, ParentType extends ResolversParentTypes['Test'] = ResolversParentTypes['Test']> = {
  testString?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type Resolvers<ContextType = DataProvider> = {
  Block?: BlockResolvers<ContextType>;
  BlockLayout?: BlockLayoutResolvers;
  BlockType?: BlockTypeResolvers;
  Certification?: CertificationResolvers<ContextType>;
  Challenge?: ChallengeResolvers<ContextType>;
  ChallengeContent?: ChallengeContentResolvers<ContextType>;
  ChallengeFile?: ChallengeFileResolvers<ContextType>;
  Curriculum?: CurriculumResolvers<ContextType>;
  DataStoreMetrics?: DataStoreMetricsResolvers<ContextType>;
  HealthCheck?: HealthCheckResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Solution?: SolutionResolvers<ContextType>;
  Superblock?: SuperblockResolvers<ContextType>;
  Test?: TestResolvers<ContextType>;
};

