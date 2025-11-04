import {
  type RawBlockLayout,
  type RawBlockLabel,
  type RawCurriculum,
  type RawSuperblock,
  type RawChapter,
  type RawModule,
  type RawBlock,
  type RawChallenge,
  type RawRequiredResource,
  BlockLayout,
  BlockLabel,
  type CurriculumData,
  type SuperblockData,
  type ChapterData,
  type ModuleData,
  type BlockData,
  type ChallengeMetadata,
  type RequiredResource,
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

const BLOCK_LABEL_MAPPING: Record<RawBlockLabel, BlockLabel> = {
  lecture: BlockLabel.LECTURE,
  lab: BlockLabel.LAB,
  workshop: BlockLabel.WORKSHOP,
  review: BlockLabel.REVIEW,
  quiz: BlockLabel.QUIZ,
  exam: BlockLabel.EXAM,
  'warm-up': BlockLabel.WARM_UP,
  practice: BlockLabel.PRACTICE,
  learn: BlockLabel.LEARN,
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
 * Normalize block label from kebab-case to SCREAMING_SNAKE_CASE enum or null
 * @param raw Raw block label string or undefined
 * @returns BlockLabel enum value or explicit null
 */
export function normalizeBlockLabel(
  raw: RawBlockLabel | undefined
): BlockLabel | null {
  return raw !== undefined ? BLOCK_LABEL_MAPPING[raw] : null;
}

/**
 * Normalize required resources array
 * @param raw Raw required resources array or undefined
 * @returns Normalized array or explicit null
 */
export function normalizeRequiredResources(
  raw: readonly RawRequiredResource[] | undefined
): readonly RequiredResource[] | null {
  if (raw === undefined) return null;
  return raw.map((resource) => ({
    src: resource.src ?? null,
    link: resource.link ?? null,
  }));
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
 * Normalize module with parent reference
 * @param raw Raw module from JSON
 * @param chapterDashedName Parent chapter identifier
 * @param superblockDashedName Parent superblock identifier
 * @returns Normalized module data
 */
export function normalizeModule(
  raw: RawModule,
  chapterDashedName: string,
  superblockDashedName: string
): ModuleData {
  return {
    dashedName: raw.dashedName,
    blocks: raw.blocks,
    moduleType: raw.moduleType ?? null,
    comingSoon: raw.comingSoon ?? false,
    chapterDashedName,
    superblockDashedName,
  };
}

/**
 * Normalize chapter with parent reference
 * @param raw Raw chapter from JSON
 * @param superblockDashedName Parent superblock identifier
 * @returns Normalized chapter data
 */
export function normalizeChapter(
  raw: RawChapter,
  superblockDashedName: string
): ChapterData {
  return {
    dashedName: raw.dashedName,
    modules: raw.modules.map((module) =>
      normalizeModule(module, raw.dashedName, superblockDashedName)
    ),
    comingSoon: raw.comingSoon ?? false,
    superblockDashedName,
  };
}

/**
 * Normalize superblock with computed isCertification flag
 * Supports both legacy (flat blocks) and new (hierarchical chapters/modules) structures
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
  let chapters: ChapterData[] = [];
  let flattenedBlocks: string[] = [];

  // Handle new v9 structure (chapters/modules)
  if (raw.chapters) {
    chapters = raw.chapters.map((chapter) =>
      normalizeChapter(chapter, dashedName)
    );

    // Flatten blocks from all chapters/modules
    for (const chapter of chapters) {
      for (const module of chapter.modules) {
        flattenedBlocks.push(...module.blocks);
      }
    }
  }
  // Handle legacy structure (flat blocks)
  else if (raw.blocks) {
    flattenedBlocks = [...raw.blocks];
  }

  return {
    dashedName,
    blocks: flattenedBlocks,
    chapters,
    isCertification: certifications.has(dashedName),
  };
}

/**
 * Normalize block with enum conversion, explicit null, and reverse references
 * @param dashedName Block identifier
 * @param raw Raw block from JSON
 * @param superblockDashedNames Parent superblock identifiers (can be multiple in v9)
 * @returns Normalized block data
 */
export function normalizeBlock(
  dashedName: string,
  raw: RawBlock,
  superblockDashedNames: readonly string[]
): BlockData {
  return {
    name: raw.name,
    dashedName,
    helpCategory: raw.helpCategory,
    challenges: raw.challengeOrder.map((ch) =>
      normalizeChallengeMetadata(ch, dashedName)
    ),
    blockLayout: normalizeBlockLayout(raw.blockLayout),
    blockLabel: normalizeBlockLabel(raw.blockLabel),
    isUpcomingChange: raw.isUpcomingChange,
    usesMultifileEditor: raw.usesMultifileEditor ?? null,
    hasEditableBoundaries: raw.hasEditableBoundaries ?? null,
    disableLoopProtectTests: raw.disableLoopProtectTests ?? null,
    disableLoopProtectPreview: raw.disableLoopProtectPreview ?? null,
    required: normalizeRequiredResources(raw.required),
    template: raw.template ?? null,
    superblockDashedNames,
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
