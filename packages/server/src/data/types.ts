/**
 * Type System Foundation for freeCodeCamp Curriculum GraphQL API
 *
 * This module defines all TypeScript types for the curriculum data model,
 * organized in three distinct layers with strict type safety requirements:
 * - Layer 1: Raw JSON Types (mirror exact JSON structure)
 * - Layer 2: Normalized Internal Types (enriched with relationships and enums)
 * - Layer 3: Challenge Content Types (future v2 database integration)
 *
 * All types enforce readonly constraints, explicit null for optional fields,
 * and zero `any` types per project constitution.
 *
 * Organization:
 * 1. Raw JSON Types
 * 2. Enums
 * 3. Normalized Internal Types
 * 4. Challenge Content Types
 * 5. Error Handling Types
 * 6. Storage Abstractions
 */

// ============================================================================
// SECTION 1: RAW JSON TYPES
// ============================================================================

/**
 * Raw block layout type as stored in JSON files.
 * Mirrors exact kebab-case string literals from curriculum data.
 */
export type RawBlockLayout =
  | 'link'
  | 'challenge-list'
  | 'challenge-grid'
  | 'dialogue-grid'
  | 'project-list'
  | 'legacy-challenge-list'
  | 'legacy-challenge-grid'
  | 'legacy-link';

/**
 * Raw block label classification as stored in JSON files.
 * Mirrors exact kebab-case string literals from curriculum data.
 * Note: Field name in JSON is "blockLabel" not "blockType"
 */
export type RawBlockLabel =
  | 'lecture'
  | 'lab'
  | 'workshop'
  | 'review'
  | 'quiz'
  | 'exam'
  | 'warm-up'
  | 'practice'
  | 'learn';

/**
 * External resource (CDN script or stylesheet) required for challenges.
 * Used in blocks that depend on external libraries (React, jQuery, etc.)
 * Can have either 'src' (for JS) or 'link' (for CSS)
 */
export interface RawRequiredResource {
  readonly src?: string;
  readonly link?: string;
}

/**
 * Raw challenge object from block JSON files.
 * Contains only metadata (id and title) - content fields deliberately ignored.
 * Enables metadata-only loading strategy for MVP.
 */
export interface RawChallenge {
  readonly id: string;
  readonly title: string;
}

/**
 * Raw curriculum structure from curriculum.json.
 * Top-level data structure containing superblock and certification identifiers.
 */
export interface RawCurriculum {
  readonly superblocks: readonly string[];
  readonly certifications: readonly string[];
}

/**
 * Raw module structure within a chapter (new v9 curriculum).
 * Contains blocks and optional metadata.
 */
export interface RawModule {
  readonly dashedName: string;
  readonly blocks: readonly string[];
  readonly moduleType?: string;
  readonly comingSoon?: boolean;
}

/**
 * Raw chapter structure (new v9 curriculum).
 * Contains modules and optional metadata.
 */
export interface RawChapter {
  readonly dashedName: string;
  readonly modules: readonly RawModule[];
  readonly comingSoon?: boolean;
}

/**
 * Raw superblock structure from superblocks/*.json files.
 * Supports both legacy (flat blocks) and new (hierarchical chapters/modules) structures.
 */
export interface RawSuperblock {
  // Optional human-readable name (e.g., "Responsive Web Design")
  // If not present in JSON, will be generated from dashedName
  readonly name?: string;

  // Legacy structure (flat)
  readonly blocks?: readonly string[];

  // New v9 structure (hierarchical)
  readonly chapters?: readonly RawChapter[];
}

/**
 * Raw block structure from blocks/*.json files.
 * Mirrors exact JSON structure with optional fields marked with ?.
 * All enum values remain as kebab-case string literals.
 */
export interface RawBlock {
  readonly name: string;
  readonly dashedName: string;
  readonly helpCategory: string;
  readonly challengeOrder: readonly RawChallenge[];
  readonly blockLayout: RawBlockLayout;
  readonly blockLabel?: RawBlockLabel;
  readonly isUpcomingChange: boolean;
  readonly usesMultifileEditor?: boolean;
  readonly hasEditableBoundaries?: boolean;
  readonly disableLoopProtectTests?: boolean;
  readonly disableLoopProtectPreview?: boolean;
  readonly required?: readonly RawRequiredResource[];
  readonly template?: string;
}

// ============================================================================
// SECTION 2: ENUMS
// ============================================================================

/**
 * Normalized block layout enumeration.
 * SCREAMING_SNAKE_CASE follows TypeScript enum conventions.
 * Used in business logic layer for type-safe layout handling.
 */
export enum BlockLayout {
  LINK = 'LINK',
  CHALLENGE_LIST = 'CHALLENGE_LIST',
  CHALLENGE_GRID = 'CHALLENGE_GRID',
  DIALOGUE_GRID = 'DIALOGUE_GRID',
  PROJECT_LIST = 'PROJECT_LIST',
  LEGACY_CHALLENGE_LIST = 'LEGACY_CHALLENGE_LIST',
  LEGACY_CHALLENGE_GRID = 'LEGACY_CHALLENGE_GRID',
  LEGACY_LINK = 'LEGACY_LINK',
}

/**
 * Normalized block label enumeration.
 * SCREAMING_SNAKE_CASE follows TypeScript enum conventions.
 * Used for pedagogical classification in business logic.
 * Note: Renamed from BlockType to match actual JSON field name "blockLabel"
 */
export enum BlockLabel {
  LECTURE = 'LECTURE',
  LAB = 'LAB',
  WORKSHOP = 'WORKSHOP',
  REVIEW = 'REVIEW',
  QUIZ = 'QUIZ',
  EXAM = 'EXAM',
  WARM_UP = 'WARM_UP',
  PRACTICE = 'PRACTICE',
  LEARN = 'LEARN',
}

/**
 * Normalized external resource structure.
 * Contains CDN URL for external library or stylesheet required by challenges.
 * Can have either 'src' (for JS) or 'link' (for CSS)
 */
export interface RequiredResource {
  readonly src?: string | null;
  readonly link?: string | null;
}

// ============================================================================
// SECTION 3: NORMALIZED INTERNAL TYPES
// ============================================================================

/**
 * Lightweight challenge reference for in-memory storage (MVP scope).
 * Contains only metadata (id, title, parent block reference).
 * Full content (description, instructions, tests) defined in ChallengeContent
 * but not loaded until v2 database integration.
 *
 * Memory footprint: ~100 bytes per challenge
 * Total for 36,000 challenges: ~3.6MB
 */
export interface ChallengeMetadata {
  readonly id: string;
  readonly title: string;
  readonly blockDashedName: string;
}

/**
 * Normalized curriculum data with validated structure.
 * Contains top-level organization of superblocks and certifications.
 */
export interface CurriculumData {
  readonly superblocks: readonly string[];
  readonly certifications: readonly string[];
}

/**
 * Normalized module data (new v9 curriculum).
 * Contains blocks within a chapter module and optional metadata.
 */
export interface ModuleData {
  readonly dashedName: string;
  readonly blocks: readonly string[];
  readonly moduleType: string | null;
  readonly comingSoon: boolean;
  readonly chapterDashedName: string; // Parent chapter reference
  readonly superblockDashedName: string; // Parent superblock reference (for resolver)
}

/**
 * Normalized chapter data (new v9 curriculum).
 * Contains modules within a chapter and optional metadata.
 */
export interface ChapterData {
  readonly dashedName: string;
  readonly modules: readonly ModuleData[];
  readonly comingSoon: boolean;
  readonly superblockDashedName: string; // Parent reference
}

/**
 * Normalized superblock data with enriched relationships.
 * Supports both legacy (flat blocks) and new (hierarchical chapters/modules) structures.
 */
export interface SuperblockData {
  readonly name: string;
  readonly dashedName: string;

  // Flattened view (all blocks from all chapters/modules)
  readonly blocks: readonly string[];

  // New v9 hierarchical structure
  readonly chapters: readonly ChapterData[];

  readonly isCertification: boolean;
}

/**
 * Certification metadata.
 *
 * Lightweight wrapper identifying certification-eligible superblocks.
 * The superblock field resolver fetches the full SuperblockData.
 */
export interface CertificationData {
  /**
   * Certification identifier (matches superblock dashedName)
   */
  readonly dashedName: string;
}

/**
 * Normalized block data with bidirectional relationships.
 * Includes normalized enums, explicit null for optionals, and reverse reference
 * to parent superblock(s) for O(1) traversal.
 * Note: In v9 curriculum, blocks can be shared across multiple superblocks.
 */
export interface BlockData {
  readonly name: string;
  readonly dashedName: string;
  readonly helpCategory: string;
  readonly challenges: readonly ChallengeMetadata[];
  readonly blockLayout: BlockLayout;
  readonly blockLabel: BlockLabel | null;
  readonly isUpcomingChange: boolean;
  readonly usesMultifileEditor: boolean | null;
  readonly hasEditableBoundaries: boolean | null;
  readonly disableLoopProtectTests: boolean | null;
  readonly disableLoopProtectPreview: boolean | null;
  readonly required: readonly RequiredResource[] | null;
  readonly template: string | null;
  readonly superblockDashedNames: readonly string[]; // Can have multiple parents in v9
}

// ============================================================================
// SECTION 4: CHALLENGE CONTENT TYPES (Future v2)
// ============================================================================

/**
 * Individual file within challenge (starter code or solution).
 * Used in ChallengeContent for code files.
 *
 * Note: Defined in MVP for schema-first development but not loaded
 * until v2 database integration.
 */
export interface ChallengeFile {
  readonly name: string;
  readonly ext: string;
  readonly contents: string;
  readonly editableRegionBoundaries: readonly number[] | null;
}

/**
 * Validation test for challenge submission.
 * Contains human-readable description and test assertion code.
 *
 * Note: Defined in MVP for schema-first development but not loaded
 * until v2 database integration.
 */
export interface Test {
  readonly text: string;
  readonly testString: string;
}

/**
 * Example solution for challenge.
 * Contains array of solution files.
 *
 * Note: Defined in MVP for schema-first development but not loaded
 * until v2 database integration.
 */
export interface Solution {
  readonly files: readonly ChallengeFile[];
}

/**
 * Full challenge content loaded from database (v2 only).
 * Contains description, instructions, files, tests, and solutions.
 *
 * Memory footprint: ~50KB per challenge
 * Total for 36,000 challenges: ~1.8GB (NOT loaded in MVP)
 *
 * Loading strategy (v2):
 * - Lazy-loaded from database on demand
 * - Cached in LRU cache (50MB limit, ~500 challenges)
 * - Never all in memory simultaneously
 *
 * Note: Type defined in MVP for future v2 migration without breaking changes.
 * GraphQL schema includes ChallengeContent types even though MVP returns null.
 */
export interface ChallengeContent {
  readonly id: string;
  readonly description: string;
  readonly instructions: string;
  readonly files: readonly ChallengeFile[];
  readonly tests: readonly Test[];
  readonly solutions: readonly Solution[];
}

// ============================================================================
// SECTION 5: ERROR HANDLING TYPES
// ============================================================================

/**
 * Generic discriminated union for type-safe success/failure states.
 * Uses success boolean as discriminator for TypeScript's control flow analysis.
 *
 * Usage pattern:
 * ```typescript
 * const result = loadBlock('path/to/block.json');
 * if (result.success) {
 *   // TypeScript knows result.data exists here
 *   console.log(result.data);
 * } else {
 *   // TypeScript knows result.error exists here
 *   console.error(result.error.message);
 * }
 * ```
 *
 * Design goal: Forces explicit error handling at compile time,
 * preventing uncaught exceptions during data loading.
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Custom error class for data validation failures.
 * Includes file path context for debugging and optional field name
 * to pinpoint exact location of validation error.
 *
 * Usage pattern:
 * ```typescript
 * throw new DataValidationError(
 *   'Invalid blockLayout value: "unknown-layout"',
 *   '/path/to/blocks/responsive-web-design.json',
 *   'blockLayout'
 * );
 * ```
 *
 * Design goal: Provides actionable debugging context (file path, field name)
 * for quick issue resolution during data loading and validation.
 */
export class DataValidationError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'DataValidationError';
  }
}

// ============================================================================
// SECTION 6: STORAGE ABSTRACTIONS
// ============================================================================

/**
 * In-memory storage structure with readonly Maps for O(1) lookups.
 * Single instance shared across all GraphQL requests for maximum performance.
 *
 * Structure:
 * - curriculum: Top-level curriculum organization
 * - superblocks: Map keyed by dashedName for O(1) superblock lookups
 * - blocks: Map keyed by dashedName for O(1) block lookups
 * - challenges: Map keyed by id for O(1) challenge metadata lookups
 *
 * Characteristics:
 * - All Maps are readonly (cannot add/remove entries after initialization)
 * - Enables safe concurrent reads without locks
 * - Metadata-only approach keeps memory under 50MB
 *
 * Estimated memory footprint:
 * - Curriculum: ~1KB
 * - Superblocks Map: ~7KB (37 entries)
 * - Blocks Map: ~368KB (737 entries)
 * - Challenges Map: ~3.6MB (36,000 entries)
 * - Total: ~4MB
 */
export interface DataStore {
  readonly curriculum: CurriculumData;
  readonly superblocks: ReadonlyMap<string, SuperblockData>;
  readonly blocks: ReadonlyMap<string, BlockData>;
  readonly challenges: ReadonlyMap<string, ChallengeMetadata>;
}

/**
 * Abstraction layer for data access (enables MVP→v2 migration).
 * Decouples GraphQL resolvers from storage implementation details.
 *
 * Interface methods:
 * - getCurriculum(): Returns top-level curriculum
 * - getSuperblock(dashedName): Returns superblock or null if not found
 * - getBlock(dashedName): Returns block or null if not found
 * - getChallenge(id): Returns challenge metadata or null if not found
 *
 * Future methods (v2 - commented placeholder):
 * - getChallengeContent(id): Async content loading from database
 *
 * Implementations:
 * - MVP: InMemoryDataProvider - All methods return from DataStore Maps
 * - v2: HybridDataProvider - Metadata from DataStore, content from database
 *
 * Design goal: GraphQL resolvers use DataProvider interface, never access
 * DataStore directly. Enables swapping implementations without resolver changes.
 */
export interface DataProvider {
  getCurriculum(): CurriculumData;
  getSuperblock(dashedName: string): SuperblockData | null;
  getBlock(dashedName: string): BlockData | null;
  getChallenge(id: string): ChallengeMetadata | null;

  // Future v2 method (commented placeholder):
  // getChallengeContent(id: string): Promise<ChallengeContent | null>;
}
