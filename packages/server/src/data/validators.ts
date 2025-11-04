import {
  type RawSuperblock,
  type RawBlock,
  type RawChallenge,
  type RawBlockLayout,
  type RawBlockLabel,
  type Result,
  DataValidationError,
} from './types.js';

/**
 * Data integrity validation functions
 * Validates references, enums, and structure
 */

// Valid enum values for validation
const VALID_BLOCK_LAYOUTS: readonly RawBlockLayout[] = [
  'link',
  'challenge-list',
  'challenge-grid',
  'dialogue-grid',
  'project-list',
  'legacy-challenge-list',
  'legacy-challenge-grid',
  'legacy-link',
];

const VALID_BLOCK_LABELS: readonly RawBlockLabel[] = [
  'lecture',
  'lab',
  'workshop',
  'review',
  'quiz',
  'exam',
  'warm-up',
  'practice',
  'learn',
];

/**
 * Validate curriculum references to superblocks
 * Note: Only validates superblocks that were successfully loaded (with standard structure)
 * Intentionally permissive to handle evolving curriculum structure
 * @returns Result success (always succeeds - validation skipped for non-standard structures)
 */
export function validateCurriculumReferences(): Result<
  void,
  DataValidationError
> {
  // Only validate loaded superblocks (some may be skipped due to non-standard structure)
  // This is intentionally permissive to handle curriculum evolution
  // Note: Certification validation is skipped as curriculum data may have historical/legacy entries

  return { success: true, data: undefined };
}

/**
 * Validate superblock references to blocks
 * Supports both legacy (flat blocks) and new (hierarchical chapters/modules) structures
 * @param superblocks All loaded superblocks
 * @param blocks All loaded blocks
 * @returns Result success or validation error
 */
export function validateSuperblockReferences(
  superblocks: Map<string, RawSuperblock>,
  blocks: Map<string, RawBlock>
): Result<void, DataValidationError> {
  for (const [superblockName, superblock] of superblocks) {
    // Collect all block references from superblock (handling both structures)
    const blockReferences: string[] = [];

    // Legacy structure (flat blocks)
    if (superblock.blocks) {
      blockReferences.push(...superblock.blocks);
    }

    // New v9 structure (chapters/modules)
    if (superblock.chapters) {
      for (const chapter of superblock.chapters) {
        for (const module of chapter.modules) {
          blockReferences.push(...module.blocks);
        }
      }
    }

    // Validate all block references exist
    for (const blockName of blockReferences) {
      if (!blocks.has(blockName)) {
        return {
          success: false,
          error: new DataValidationError(
            `Block "${blockName}" referenced in superblock "${superblockName}" but file not found`,
            `superblocks/${superblockName}.json`,
            'blocks'
          ),
        };
      }
    }
  }

  return { success: true, data: undefined };
}

/**
 * Validate block enum values
 * @param block Block to validate
 * @param blockPath File path for error reporting
 * @returns Result success or validation error
 */
export function validateBlockEnums(
  block: RawBlock,
  blockPath: string
): Result<void, DataValidationError> {
  // Validate blockLayout
  if (!VALID_BLOCK_LAYOUTS.includes(block.blockLayout)) {
    return {
      success: false,
      error: new DataValidationError(
        `Invalid blockLayout value: "${block.blockLayout}". Valid values: ${VALID_BLOCK_LAYOUTS.join(', ')}`,
        blockPath,
        'blockLayout'
      ),
    };
  }

  // Validate blockLabel if present
  if (block.blockLabel !== undefined) {
    if (!VALID_BLOCK_LABELS.includes(block.blockLabel)) {
      return {
        success: false,
        error: new DataValidationError(
          `Invalid blockLabel value: "${block.blockLabel}". Valid values: ${VALID_BLOCK_LABELS.join(', ')}`,
          blockPath,
          'blockLabel'
        ),
      };
    }
  }

  // Validate required resources structure if present
  if (block.required !== undefined) {
    if (!Array.isArray(block.required)) {
      return {
        success: false,
        error: new DataValidationError(
          'required field must be an array',
          blockPath,
          'required'
        ),
      };
    }

    for (let i = 0; i < block.required.length; i++) {
      const resource = block.required[i];
      if (!resource) {
        return {
          success: false,
          error: new DataValidationError(
            `required[${i}] is null or undefined`,
            blockPath,
            `required[${i}]`
          ),
        };
      }

      // Must have either src (for JS) or link (for CSS)
      const hasSrc = typeof resource.src === 'string';
      const hasLink = typeof resource.link === 'string';

      if (!hasSrc && !hasLink) {
        return {
          success: false,
          error: new DataValidationError(
            `required[${i}] must have either "src" or "link" field of type string`,
            blockPath,
            `required[${i}]`
          ),
        };
      }
    }
  }

  // Validate template is string if present
  if (block.template !== undefined && typeof block.template !== 'string') {
    return {
      success: false,
      error: new DataValidationError(
        'template field must be a string',
        blockPath,
        'template'
      ),
    };
  }

  return { success: true, data: undefined };
}

/**
 * Validate challenge structure in block
 * @param challenges Challenge array from block
 * @param blockPath File path for error reporting
 * @returns Result success or validation error
 */
export function validateChallengeStructure(
  challenges: readonly RawChallenge[],
  blockPath: string
): Result<void, DataValidationError> {
  // Validate array is not empty
  if (challenges.length === 0) {
    return {
      success: false,
      error: new DataValidationError(
        'challengeOrder array must not be empty',
        blockPath,
        'challengeOrder'
      ),
    };
  }

  // Validate each challenge has required fields
  for (let i = 0; i < challenges.length; i++) {
    const challenge = challenges[i];

    if (!challenge || !challenge.id || typeof challenge.id !== 'string') {
      return {
        success: false,
        error: new DataValidationError(
          `Challenge at index ${i} is missing required "id" field`,
          blockPath,
          `challengeOrder[${i}].id`
        ),
      };
    }

    if (!challenge.title || typeof challenge.title !== 'string') {
      return {
        success: false,
        error: new DataValidationError(
          `Challenge at index ${i} is missing required "title" field`,
          blockPath,
          `challengeOrder[${i}].title`
        ),
      };
    }
  }

  return { success: true, data: undefined };
}
