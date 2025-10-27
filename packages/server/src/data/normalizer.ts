import {
  type RawBlockLayout,
  type RawBlockType,
  type RawCurriculum,
  type RawSuperblock,
  type RawBlock,
  type RawChallenge,
  BlockLayout,
  BlockType,
  type CurriculumData,
  type SuperblockData,
  type BlockData,
  type ChallengeMetadata,
} from './types.js';

/**
 * Type transformation functions
 * Converts Raw JSON types to Normalized internal types
 */

// Enum mapping tables
const BLOCK_LAYOUT_MAPPING: Record<RawBlockLayout, BlockLayout> = {
  link: BlockLayout.LINK,
  'challenge-list': BlockLayout.CHALLENGE_LIST,
  'challenge-grid': BlockLayout.CHALLENGE_GRID,
  'dialogue-grid': BlockLayout.DIALOGUE_GRID,
  'project-list': BlockLayout.PROJECT_LIST,
  'legacy-challenge-list': BlockLayout.LEGACY_CHALLENGE_LIST,
  'legacy-challenge-grid': BlockLayout.LEGACY_CHALLENGE_GRID,
  'legacy-link': BlockLayout.LEGACY_LINK,
};

const BLOCK_TYPE_MAPPING: Record<RawBlockType, BlockType> = {
  lecture: BlockType.LECTURE,
  lab: BlockType.LAB,
  workshop: BlockType.WORKSHOP,
  review: BlockType.REVIEW,
  quiz: BlockType.QUIZ,
  exam: BlockType.EXAM,
  'warm-up': BlockType.WARM_UP,
  practice: BlockType.PRACTICE,
  learn: BlockType.LEARN,
};

/**
 * Normalize block layout from kebab-case to SCREAMING_SNAKE_CASE enum
 * @param raw Raw block layout string
 * @returns BlockLayout enum value
 */
export function normalizeBlockLayout(raw: RawBlockLayout): BlockLayout {
  return BLOCK_LAYOUT_MAPPING[raw];
}

/**
 * Normalize block type from kebab-case to SCREAMING_SNAKE_CASE enum or null
 * @param raw Raw block type string or undefined
 * @returns BlockType enum value or explicit null
 */
export function normalizeBlockType(
  raw: RawBlockType | undefined
): BlockType | null {
  return raw !== undefined ? BLOCK_TYPE_MAPPING[raw] : null;
}

/**
 * Normalize curriculum data (already validated, just preserve structure)
 * @param raw Raw curriculum from JSON
 * @returns Normalized curriculum data
 */
export function normalizeCurriculum(raw: RawCurriculum): CurriculumData {
  return {
    superblocks: raw.superblocks,
    certifications: raw.certifications,
  };
}

/**
 * Normalize superblock with computed isCertification flag
 * @param dashedName Superblock identifier
 * @param raw Raw superblock from JSON
 * @param certifications Set of certification names
 * @returns Normalized superblock data
 */
export function normalizeSuperblock(
  dashedName: string,
  raw: RawSuperblock,
  certifications: Set<string>
): SuperblockData {
  return {
    dashedName,
    blocks: raw.blocks,
    isCertification: certifications.has(dashedName),
  };
}

/**
 * Normalize block with enum conversion, explicit null, and reverse reference
 * @param dashedName Block identifier
 * @param raw Raw block from JSON
 * @param superblockDashedName Parent superblock identifier
 * @returns Normalized block data
 */
export function normalizeBlock(
  dashedName: string,
  raw: RawBlock,
  superblockDashedName: string
): BlockData {
  return {
    name: raw.name,
    dashedName,
    helpCategory: raw.helpCategory,
    challenges: raw.challengeOrder.map((ch) =>
      normalizeChallengeMetadata(ch, dashedName)
    ),
    blockLayout: normalizeBlockLayout(raw.blockLayout),
    blockType: normalizeBlockType(raw.blockType),
    isUpcomingChange: raw.isUpcomingChange,
    usesMultifileEditor: raw.usesMultifileEditor ?? null,
    hasEditableBoundaries: raw.hasEditableBoundaries ?? null,
    superblockDashedName,
  };
}

/**
 * Normalize challenge metadata extracting only id and title
 * DELIBERATELY IGNORES all content fields (description, instructions, tests, solutions)
 * @param raw Raw challenge from challengeOrder
 * @param blockDashedName Parent block identifier
 * @returns Challenge metadata with reverse reference
 */
export function normalizeChallengeMetadata(
  raw: RawChallenge,
  blockDashedName: string
): ChallengeMetadata {
  return {
    id: raw.id,
    title: raw.title,
    blockDashedName,
  };
}
