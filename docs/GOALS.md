# freeCodeCamp Curriculum GraphQL API

This project aims to be a TypeSafe GraphQL API server for freeCodeCamp's curriculum. For the MVP, the server will mainly host all the structural metadata about the curriculum.

## Data Model Analysis

The curriculum data is organized hierarchically:

### Curriculum (top-level)

Contains lists of superblocks and certifications (certifications are a subset of superblocks that represent completed curricula).

### Superblock

Represents a major curriculum area (e.g., "responsive-web-design", "javascript-algorithms-and-data-structures"). Each superblock JSON contains:

- `blocks`: Array of block identifiers (strings)

### Block

Represents a module within a superblock. Each block JSON contains:

**Required fields:**
- `name`: Human-readable name
- `dashedName`: URL-friendly identifier
- `helpCategory`: Category for help/support (e.g., "HTML-CSS", "JavaScript", "Backend Development")
- `challengeOrder`: Array of challenge objects with `id` and `title`
- `blockLayout`: Layout type (see BlockLayout enum below)
- `isUpcomingChange`: Boolean indicating if the module is WIP

**Optional fields:**
- `blockType`: Type of block (lecture, lab, workshop, review, quiz, exam, warm-up, practice, learn) - present in ~68% of blocks
- `usesMultifileEditor`: Boolean indicating if the block uses a multifile editor
- `hasEditableBoundaries`: Boolean for editable boundaries feature

### Challenge

Within each block's `challengeOrder`, each challenge has:

- `id`: Unique identifier
- `title`: Challenge title

### Data Scale

Based on the current curriculum structure:

- **37 superblocks** across various learning paths (web development, data science, languages, etc.)
- **737 blocks** containing learning modules
- **32+ certifications** available for completion

**Block Type Distribution:**
- Lecture: 123 blocks
- Lab: 117 blocks
- Workshop: 74 blocks
- Review: 73 blocks
- Quiz: 68 blocks
- Exam: 6 blocks
- Warm-up: 2 blocks
- Practice: 2 blocks
- Learn: 7 blocks
- No blockType specified: 234 blocks

**Block Layout Distribution:**
- Link: 269 blocks
- Challenge List: 121 blocks
- Challenge Grid: 83 blocks
- Legacy Challenge List: 80 blocks
- Dialogue Grid: 56 blocks
- Legacy Challenge Grid: 49 blocks
- Project List: 32 blocks
- Legacy Link: 15 blocks

## System Architecture

```
┌─────────────────┐
│ GraphQL API     │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Data Layer      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ File System     │
└─────────────────┘
```

## Technology Stack

**Monorepo:** pnpm workspaces for efficient dependency management and strict isolation

**Core Dependencies:**
- **GraphQL Yoga** (v5+): Modern, lightweight GraphQL server
- **GraphQL Code Generator**: TypeScript type generation from GraphQL schema
- **TypeScript** (v5+): Strict type safety with no `any` types

**Development Tools:**
- **tsx**: TypeScript execution with hot reload for development
- **ESLint**: Code quality and consistency

**TypeScript Configuration:**
- Target: ES2022 with ESM modules
- Strict mode enabled with all strict flags
- `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` for extra safety

**Data Storage:**

*MVP (Current):* In-memory metadata only - curriculum structure without lesson content
*Future (v2):* Hybrid architecture - structure in-memory, content from database with caching

The curriculum data is static and read-only for MVP. Load all JSON files into memory on server startup for fast access. Use `Map<string, T>` structures for O(1) lookups by identifier.

## GraphQL Schema Design

```graphql
type Query {
  curriculum: Curriculum!
  superblock(dashedName: String!): Superblock
  superblocks: [Superblock!]!
  block(dashedName: String!): Block
  blocks(superblockDashedName: String): [Block!]!
  challenge(id: ID!): Challenge
  challenges(blockDashedName: String): [Challenge!]!
  certifications: [Certification!]!
}

type Curriculum {
  superblocks: [String!]!
  certifications: [String!]!
}

type Superblock {
  dashedName: String!
  blocks: [String!]!
  blockObjects: [Block!]!
  isCertification: Boolean!
}

type Block {
  name: String!
  dashedName: String!
  helpCategory: String!
  challengeOrder: [Challenge!]!
  blockLayout: BlockLayout!
  blockType: BlockType
  isUpcomingChange: Boolean!
  usesMultifileEditor: Boolean
  hasEditableBoundaries: Boolean
  superblock: Superblock!
}

enum BlockLayout {
  LINK
  CHALLENGE_LIST
  CHALLENGE_GRID
  DIALOGUE_GRID
  PROJECT_LIST
  LEGACY_CHALLENGE_LIST
  LEGACY_CHALLENGE_GRID
  LEGACY_LINK
}

enum BlockType {
  LECTURE
  LAB
  WORKSHOP
  REVIEW
  QUIZ
  EXAM
  WARM_UP
  PRACTICE
  LEARN
}

type Challenge {
  """Challenge metadata - always available"""
  id: ID!
  title: String!
  block: Block!

  """
  Full challenge content - MVP returns null
  Future: Lazy-loaded from database
  """
  content: ChallengeContent
}

type ChallengeContent {
  description: String!
  instructions: String!
  files: [ChallengeFile!]!
  tests: [Test!]!
  solutions: [Solution!]!
}

type ChallengeFile {
  name: String!
  ext: String!
  contents: String!
  editableRegionBoundaries: [Int!]
}

type Test {
  text: String!
  testString: String!
}

type Solution {
  files: [ChallengeFile!]!
}

type Certification {
  dashedName: String!
  superblock: Superblock!
}
```

### Key Design Decisions

- `Superblock.blockObjects` provides resolved Block objects for convenience
- `Certification` is a wrapper around Superblock to distinguish certification-eligible curricula
- All relationships are bidirectional (e.g., Challenge can reference its Block, Block can reference its Superblock)
- IDs are strings (dashedNames or UUIDs) rather than database IDs since data is file-based
- Enums for `BlockLayout` and `BlockType` ensure type safety and validation
- Optional fields (`blockType`, `usesMultifileEditor`, `hasEditableBoundaries`) provide flexibility as the curriculum evolves
- **Scalability:** Separate metadata (in-memory) from content (future database) - `Challenge.content` field returns `null` in MVP
- **Future-proof:** `DataProvider` abstraction allows switching from in-memory to hybrid without API changes
- **Type safety:** Three-layer type system (Raw JSON → Normalized Internal → Generated GraphQL) with no `any` types

## Type System Design

### Type Layers

**1. Raw JSON Types** (`RawCurriculum`, `RawSuperblock`, `RawBlock`)
- Mirror exact JSON file structure
- All fields readonly
- String-based enums (as stored in JSON: `"challenge-list"`, `"lecture"`)

**2. Normalized Internal Types** (`CurriculumData`, `SuperblockData`, `BlockData`, `ChallengeData`)
- Enriched with computed relationships
- Normalized enums (SCREAMING_SNAKE_CASE: `CHALLENGE_LIST`, `LECTURE`)
- Pre-computed bidirectional references
- Explicit `null` for missing optional fields (not `undefined`)

**3. Generated GraphQL Types** (`types.generated.ts`)
- Auto-generated from GraphQL schema via codegen
- Resolver types with proper context typing
- Mapped to internal data types

### Type Safety Principles

- **No `any` types allowed** - all data explicitly typed
- **Readonly by default** - prevents accidental mutations
- **Strict null checks** - distinguish `null`, `undefined`, missing values
- **Result types** - type-safe error handling: `Result<T, E>` instead of throwing
- **Enum normalization** - convert kebab-case JSON to SCREAMING_SNAKE_CASE enums

### Code Generation

**GraphQL → TypeScript:**
```typescript
// codegen.ts configuration
{
  mappers: {
    Superblock: '@/data/types#SuperblockData',
    Block: '@/data/types#BlockData',
    Challenge: '@/data/types#ChallengeData',
  },
  contextType: '@/data/types#DataStore'
}
```

This ensures resolver signatures automatically match internal types.

## Scalability Architecture

### Design Philosophy

**MVP Approach:** In-memory metadata, optimized for speed and simplicity
**Future Approach:** Hybrid tiered architecture - structure in-memory, content from database
**Transition Goal:** Zero breaking changes to GraphQL API or resolvers

### Data Separation Strategy

**Structure Data (Always In-Memory):**
- Curriculum organization (superblocks, blocks, certifications)
- Challenge metadata (IDs, titles, block relationships)
- Layout and type information
- **Expected size:** 5-50MB even at 100k+ challenges
- **Access pattern:** Read on every request
- **Update frequency:** Weekly/monthly

**Content Data (Future: Database + Cache):**
- Challenge descriptions, instructions, hints
- Test cases and validation logic
- Solution files and code templates
- **Expected size:** 100MB-1GB+ at scale
- **Access pattern:** Requested individually, not bulk
- **Update frequency:** Daily during active development

### Type System: Metadata vs Content

```typescript
// METADATA (in-memory, MVP)
export interface ChallengeMetadata {
  readonly id: string;
  readonly title: string;
  readonly blockDashedName: string;
  // No content - just structural information
}

export interface BlockData {
  readonly name: string;
  readonly dashedName: string;
  readonly helpCategory: string;
  readonly challenges: readonly ChallengeMetadata[];  // Metadata only
  readonly blockLayout: BlockLayout;
  readonly blockType: BlockType | null;
  readonly isUpcomingChange: boolean;
  readonly superblockDashedName: string;
  readonly usesMultifileEditor: boolean | null;
  readonly hasEditableBoundaries: boolean | null;
}

// CONTENT (future: database + cache)
export interface ChallengeContent {
  readonly id: string;
  readonly description: string;
  readonly instructions: string;
  readonly files: readonly ChallengeFile[];
  readonly tests: readonly Test[];
  readonly solutions: readonly Solution[];
}

export interface ChallengeFile {
  readonly name: string;
  readonly ext: string;
  readonly contents: string;
  readonly editableRegionBoundaries?: readonly number[];
}
```

### Data Provider Abstraction

```typescript
// Core abstraction - implementation can change without breaking API
interface DataProvider {
  getCurriculum(): CurriculumData;
  getSuperblock(dashedName: string): SuperblockData | null;
  getBlock(dashedName: string): BlockData | null;
  getChallenge(id: string): ChallengeMetadata | null;

  // Future: Add async content methods
  // getChallengeContent(id: string): Promise<ChallengeContent | null>;
}

// MVP Implementation
class InMemoryDataProvider implements DataProvider {
  constructor(private store: DataStore) {}

  getCurriculum() { return this.store.curriculum; }
  getSuperblock(name: string) { return this.store.superblocks.get(name) ?? null; }
  getBlock(name: string) { return this.store.blocks.get(name) ?? null; }
  getChallenge(id: string) { return this.store.challenges.get(id) ?? null; }
}

// Future: Hybrid Implementation
class HybridDataProvider implements DataProvider {
  constructor(
    private structureStore: DataStore,     // In-memory structure
    private contentLoader: ContentLoader   // Database + cache
  ) {}

  // Same sync methods for structure
  getCurriculum() { return this.structureStore.curriculum; }
  getSuperblock(name: string) { return this.structureStore.superblocks.get(name) ?? null; }

  // New async method for content
  async getChallengeContent(id: string): Promise<ChallengeContent | null> {
    return this.contentLoader.load(id);
  }
}
```

### GraphQL Schema: Future-Ready Design

```graphql
type Challenge {
  # Metadata - always available instantly
  id: ID!
  title: String!
  block: Block!

  # Content - MVP returns null, future loads from database
  content: ChallengeContent
}

type ChallengeContent {
  description: String!
  instructions: String!
  files: [ChallengeFile!]!
  tests: [Test!]!
  solutions: [Solution!]!
}
```

**Key Design:** The `content` field exists in schema from day one but returns `null` in MVP. When v2 adds database, we implement the resolver - no API breaking changes.

### Future Architecture (v2): Hybrid Tiered System

```
┌─────────────────────────────────────────┐
│         GraphQL API Layer               │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│   L1: In-Memory Structure Cache         │
│   - Curriculum, Superblocks, Blocks     │
│   - Challenge Metadata (IDs, titles)    │
│   - Always loaded, ~5-50MB              │
│   - Instant access, no latency          │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│   L2: LRU Cache (Hot Content)           │
│   - Challenge content (descriptions,    │
│     instructions, tests, solutions)     │
│   - 500 most recent, ~50MB limit        │
│   - TTL: 1 hour                         │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│   L3: Database (PostgreSQL)             │
│   - Full challenge content              │
│   - Source of truth                     │
│   - Updated by sync service             │
└─────────────────────────────────────────┘
```

### Memory Scaling Analysis

**Current State (MVP):**
```
737 blocks × 50 challenges avg × 100 bytes = ~3.7MB
+ Superblocks & relationships = ~5MB total
```

**Future Scale Estimates:**
```
Metadata Only (Structure):
10,000 blocks × 50 challenges × 100 bytes = ~50MB
100,000 challenges × 100 bytes = ~10MB

With Full Content (if loaded into memory):
100,000 challenges × 50KB avg = ~5GB (NOT FEASIBLE)
```

**Conclusion:** Metadata-only in-memory is sustainable even at 10x growth. Content must be lazy-loaded.

### Migration Path to v2

**Phase 1 (MVP - Current):**
1. Load metadata only from JSON files
2. Return `null` for `Challenge.content` field
3. Monitor memory usage via health checks
4. Validate architecture with real traffic

**Phase 2 (v2 - Content Addition):**
1. Add `ContentLoader` interface and PostgreSQL implementation
2. Implement LRU cache layer (50MB limit, 500 challenges)
3. Add `getChallengeContent()` to `HybridDataProvider`
4. Update `Challenge.content` resolver to call provider
5. **Zero changes to GraphQL schema or client queries**

**Phase 3 (Future - Optional Optimization):**
1. Add Redis for distributed caching if needed
2. Implement prefetch strategies for common paths
3. Add CDN caching for static content
4. Database read replicas for scaling

### Health Monitoring

```typescript
interface HealthCheckResponse {
  status: 'healthy' | 'degraded';
  uptime: number;
  dataStore: {
    superblockCount: number;
    blockCount: number;
    challengeCount: number;
    memoryUsageMB: number;
  };
  cache?: {
    hitRate: number;
    size: number;
    evictions: number;
  };
}

// GraphQL health check query
type Query {
  _health: HealthCheck!
}

type HealthCheck {
  superblockCount: Int!
  blockCount: Int!
  challengeCount: Int!
  memoryUsageMB: Float!
}
```

**Alerting Thresholds:**
- Warning: Memory usage > 100MB (metadata only should stay under 50MB)
- Critical: Memory usage > 200MB (indicates possible memory leak)
- Cache hit rate < 80% (tune cache size or TTL)

## Data Loading Strategy

### Loading Process

**Phase 1: Load Raw Data**
```typescript
// Parallel loading of all JSON files
const [curriculum, superblocks, blocks] = await Promise.all([
  loadCurriculum(),      // data/structure/curriculum.json
  loadSuperblocks(),     // data/structure/superblocks/*.json
  loadBlocks()           // data/structure/blocks/*.json
]);
```

**Phase 2: Validate Integrity**
- Verify all superblock references in curriculum exist
- Verify all block references in superblocks exist
- Verify all certifications correspond to superblocks
- Validate enum values against allowed types
- Return detailed errors with file paths on failure

**Phase 3: Build Data Store**
```typescript
interface DataStore {
  curriculum: CurriculumData;
  superblocks: ReadonlyMap<string, SuperblockData>;
  blocks: ReadonlyMap<string, BlockData>;
  challenges: ReadonlyMap<string, ChallengeData>;
}
```

**Phase 4: Pre-compute Relationships**
- Build `blockToSuperblock` reverse mapping
- Build `challengeToBlock` reverse mapping
- Compute `isCertification` flags
- Normalize enum values to GraphQL format

### Data Transformation

**Enum Normalization:**
```typescript
// JSON: "challenge-list" → TypeScript: BlockLayout.CHALLENGE_LIST
// JSON: "lecture" → TypeScript: BlockType.LECTURE
```

**Optional Field Handling:**
- `blockType`: `undefined` in JSON → `null` in TypeScript
- Store explicit `null` for clarity and GraphQL compatibility

**Relationship Enrichment:**
- Each `BlockData` includes `superblockDashedName`
- Each `ChallengeData` includes `blockDashedName`
- Enables O(1) bidirectional traversal

### Error Handling

**Result Type Pattern:**
```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

**Validation Errors:**
```typescript
class DataValidationError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly field?: string
  )
}
```

All loading operations return `Result` types, preventing unhandled exceptions.

## Implementation Considerations

### Monorepo Structure

```
curriculum-db/
├── pnpm-workspace.yaml         # Workspace configuration
├── package.json                # Root package with workspace scripts
├── tsconfig.base.json          # Shared TypeScript config
├── data/                       # Curriculum data (copied from main repo)
│   └── structure/
│       ├── curriculum.json
│       ├── superblocks/        # 37 superblock JSONs
│       └── blocks/             # 737 block JSONs
├── docs/
│   └── GOALS.md
└── packages/
    ├── server/                 # GraphQL API server
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── codegen.ts          # GraphQL Code Generator config
    │   └── src/
    │       ├── index.ts        # Server entry point
    │       ├── server.ts       # GraphQL Yoga setup
    │       ├── schema/
    │       │   ├── schema.graphql
    │       │   ├── types.generated.ts  # Auto-generated from schema
    │       │   └── resolvers/
    │       │       ├── index.ts
    │       │       ├── Query.ts
    │       │       ├── Superblock.ts
    │       │       ├── Block.ts
    │       │       ├── Challenge.ts
    │       │       └── Certification.ts
    │       ├── data/
    │       │   ├── types.ts    # Internal data model types
    │       │   ├── loader.ts   # JSON file loading
    │       │   ├── store.ts    # Data store initialization
    │       │   └── validators.ts
    │       └── utils/
    │           ├── errors.ts
    │           └── logger.ts
    │
    └── codegen/                # Future: Code generation tooling
        └── package.json
```

**Key Principles:**
- No symlinking - data folder at repository root
- Server package reads data from `../../data/structure/`
- Each package is independently buildable and testable
- Shared TypeScript config at root level

### Package Management

**Root Package Scripts:**
```json
{
  "scripts": {
    "dev": "pnpm --filter @fcc/curriculum-server dev",
    "build": "pnpm -r build",
    "type-check": "pnpm -r type-check",
    "codegen": "pnpm --filter @fcc/curriculum-server codegen"
  }
}
```

**Server Package Scripts:**
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "codegen": "graphql-codegen --config codegen.ts",
    "type-check": "tsc --noEmit"
  }
}
```

### Resolver Implementation Pattern

**Strongly-Typed Resolvers:**
```typescript
import type { Resolvers } from '../schema/types.generated.ts';

export const resolvers: Resolvers = {
  Query: {
    curriculum: (_parent, _args, context) => context.curriculum,
    superblock: (_parent, { dashedName }, context) =>
      context.superblocks.get(dashedName) ?? null,
    // ... other resolvers
  },
  Block: {
    superblock: (parent, _args, context) =>
      context.superblocks.get(parent.superblockDashedName)!,
    challengeOrder: (parent) => parent.challenges,
  },
  // ... other type resolvers
};
```

The generated types ensure compile-time safety for all resolver signatures.

### Performance Optimizations

**Startup:**
- Parallel JSON file loading via `Promise.all()`
- Single-pass data structure building
- All relationships pre-computed once

**Runtime:**
- `Map<string, T>` for O(1) lookups by identifier
- Immutable data structures enable safe concurrent reads
- No file I/O during request handling
- GraphQL Yoga's built-in query caching

**Memory:**
- Expected memory usage: ~10-20MB for 737 blocks
- All data readonly prevents accidental memory leaks
- Single shared data store instance across requests

### Error Handling

**Loading Phase:**
- Use `Result<T, E>` pattern to prevent uncaught exceptions
- `DataValidationError` includes file path and field name
- Fail fast on startup if data is invalid
- Detailed error messages for debugging

**Runtime Phase:**
- GraphQL nullable return types for missing resources
- Return `null` instead of throwing for not found queries
- Structured error responses via GraphQL error handling
- No server crashes from bad queries

**Validation:**
- JSON syntax errors caught and reported with file path
- Enum value validation with clear error messages
- Reference integrity checks (superblock → block, block → challenge)
- Legacy/deprecated field warnings logged but not fatal

### Extensibility

- Design resolvers to easily add more fields if additional metadata becomes available
- Consider adding search/filter capabilities (e.g., by helpCategory)
- Support for future dynamic data sources (database) through interface abstraction

### Security & Deployment

- CORS configuration for frontend access
- Rate limiting if public-facing
- Health check endpoints
- Docker containerization for deployment

## Implementation Roadmap

### Phase 1: Monorepo Setup
1. Initialize pnpm workspace configuration
2. Create root `package.json` and `tsconfig.base.json`
3. Set up `packages/server/` structure
4. Install core dependencies (GraphQL Yoga, TypeScript, tsx)

### Phase 2: Type System
1. Create `data/types.ts` with raw and normalized types
2. Define `BlockLayout` and `BlockType` enums
3. Implement `Result<T, E>` and `DataValidationError` types
4. Define `DataStore` interface
5. **Separate `ChallengeMetadata` from `ChallengeContent` types**
6. **Create `DataProvider` interface for abstraction**

### Phase 3: Data Loading
1. Implement `loader.ts` for JSON file reading
2. **Load metadata only (id, title) - ignore content fields**
3. Create `validators.ts` for integrity checks
4. Build `store.ts` for data transformation and normalization
5. Implement `InMemoryDataProvider` class
6. Add comprehensive error handling with `Result` types

### Phase 4: GraphQL Schema
1. Write `schema.graphql` with complete type definitions
2. **Include `ChallengeContent` types even though MVP returns `null`**
3. Configure GraphQL Code Generator in `codegen.ts`
4. Set up type mappers for `DataProvider` context
5. Generate TypeScript types with mapper configuration
6. Verify generated types match internal data types

### Phase 5: Resolvers
1. Implement Query resolvers (curriculum, superblock(s), block(s), etc.)
2. Implement type resolvers (Block.superblock, Challenge.block, etc.)
3. **Implement `Challenge.content` resolver to return `null` (future placeholder)**
4. Add null handling for not-found resources
5. Use `DataProvider` interface in all resolvers (not direct store access)
6. Ensure all resolvers are fully typed

### Phase 6: Server Setup
1. Create GraphQL Yoga server instance
2. Initialize `InMemoryDataProvider` on startup
3. Add error handling for failed initialization (exit with error)
4. Configure CORS for frontend access
5. **Add `/health` REST endpoint and `_health` GraphQL query**
6. Implement memory usage monitoring and logging
7. Set up development hot reload with tsx

### Phase 7: Testing & Validation
1. Verify data loads successfully from `data/structure/`
2. Test all GraphQL queries against real curriculum data
3. **Verify `Challenge.content` returns `null` consistently**
4. Validate type safety (no `any` types in codebase)
5. Check memory usage stays under 50MB for metadata
6. Validate startup performance (< 1 second)
7. Test health check endpoint reports accurate metrics
8. Verify `DataProvider` abstraction works correctly

### Phase 8: Documentation & Tooling
1. Add README for server package
2. Document GraphQL API usage
3. Set up ESLint configuration
4. Add VS Code workspace settings for optimal DX

## Success Criteria

**MVP Requirements:**
- ✅ All 737 blocks load successfully without errors
- ✅ All GraphQL queries return properly typed data
- ✅ Zero `any` types in the codebase
- ✅ Data store initializes in < 1 second
- ✅ Memory usage stays under 50MB (metadata only)
- ✅ TypeScript compilation with no errors
- ✅ All relationships (bidirectional) work correctly
- ✅ Nullable queries return `null` instead of throwing
- ✅ Health check endpoint reports accurate statistics
- ✅ `Challenge.content` field returns `null` (future placeholder)

**Architecture Validation:**
- ✅ `DataProvider` abstraction isolates data access
- ✅ Type system separates `ChallengeMetadata` from `ChallengeContent`
- ✅ GraphQL schema includes content types (even if unused in MVP)
- ✅ No tight coupling to in-memory implementation
- ✅ Clear migration path documented for v2 database integration

## Future: v2 Migration Checklist

When ready to add full challenge content from database:

### Prerequisites
- [ ] Database schema designed for challenge content
- [ ] Content sync service built to populate database from curriculum source
- [ ] Database deployed and populated with initial data
- [ ] LRU cache library selected (e.g., `lru-cache`)

### Implementation Steps

**1. Add Content Loader**
```typescript
// packages/server/src/data/content-loader.ts
interface ContentLoader {
  load(id: string): Promise<ChallengeContent | null>;
}

class DatabaseContentLoader implements ContentLoader {
  constructor(
    private db: Database,
    private cache: LRUCache<string, ChallengeContent>
  ) {}

  async load(id: string): Promise<ChallengeContent | null> {
    const cached = this.cache.get(id);
    if (cached) return cached;

    const content = await this.db.getChallengeContent(id);
    if (content) this.cache.set(id, content);

    return content;
  }
}
```

**2. Update DataProvider**
```typescript
// Add method to interface
interface DataProvider {
  // ... existing methods
  getChallengeContent?(id: string): Promise<ChallengeContent | null>;
}

// Create hybrid implementation
class HybridDataProvider implements DataProvider {
  constructor(
    private structureStore: DataStore,
    private contentLoader: ContentLoader
  ) {}

  // Existing methods unchanged
  getCurriculum() { return this.structureStore.curriculum; }
  // ...

  // New method
  async getChallengeContent(id: string) {
    return this.contentLoader.load(id);
  }
}
```

**3. Update Resolver**
```typescript
// packages/server/src/schema/resolvers/Challenge.ts
export const Challenge: ChallengeResolvers = {
  content: async (parent, _args, context) => {
    // Check if provider supports content loading
    if ('getChallengeContent' in context.dataProvider) {
      return context.dataProvider.getChallengeContent(parent.id);
    }
    return null;
  },
};
```

**4. Update Configuration**
```typescript
// packages/server/src/config.ts
export async function createDataProvider(config: ServerConfig) {
  if (config.mode === 'hybrid') {
    const structureResult = await initializeDataStore(config.dataPath);
    if (!structureResult.success) throw structureResult.error;

    const db = await createDatabaseConnection(config.database!);
    const cache = new LRUCache<string, ChallengeContent>({
      max: 500,
      maxSize: 50 * 1024 * 1024,
      sizeCalculation: (v) => JSON.stringify(v).length,
    });

    const contentLoader = new DatabaseContentLoader(db, cache);
    return new HybridDataProvider(structureResult.data, contentLoader);
  }

  // Fall back to file mode
  // ...
}
```

**5. Update Health Check**
```typescript
interface HealthCheckResponse {
  // ... existing fields
  cache?: {
    hitRate: number;
    size: number;
    evictions: number;
  };
}
```

**6. Deploy**
- [ ] Deploy database with content
- [ ] Update environment variables (`DATA_MODE=hybrid`, `DATABASE_URL=...`)
- [ ] Monitor memory usage (should stay under 100MB)
- [ ] Monitor cache hit rate (target > 80%)
- [ ] Monitor query latency (content queries may be slower than structure)

### Zero Breaking Changes

✅ GraphQL schema unchanged (content field already exists)
✅ Existing queries work identically
✅ `Challenge.content` transitions from `null` to actual data
✅ Clients already handle nullable `content` field
✅ No client updates required

### Rollback Plan

If issues arise, revert `DATA_MODE=file` environment variable. Server restarts with in-memory provider, all queries return `content: null` again.
