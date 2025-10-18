import { promises as fs } from 'fs';
import path from 'path';
import {
  type RawCurriculum,
  type RawSuperblock,
  type RawBlock,
  type Result,
  DataValidationError,
} from './types.js';

/**
 * File I/O operations for loading curriculum JSON files
 * All functions return Result<T, DataValidationError> for type-safe error handling
 */

/**
 * Load curriculum.json file from data/structure/ directory
 * @param dataPath Absolute path to data/structure/ directory
 * @returns Result containing RawCurriculum or error with file path
 */
export async function loadCurriculumFile(
  dataPath: string
): Promise<Result<RawCurriculum, DataValidationError>> {
  const filePath = path.join(dataPath, 'curriculum.json');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as RawCurriculum;
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: new DataValidationError(
        `Failed to load curriculum.json: ${message}`,
        filePath
      ),
    };
  }
}

/**
 * Load a single superblock JSON file
 * @param dashedName Superblock identifier (e.g., "responsive-web-design")
 * @param dataPath Absolute path to data/structure/ directory
 * @returns Result containing RawSuperblock or error with file path
 */
export async function loadSuperblockFile(
  dashedName: string,
  dataPath: string
): Promise<Result<RawSuperblock, DataValidationError>> {
  const filePath = path.join(dataPath, 'superblocks', `${dashedName}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as RawSuperblock;
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: new DataValidationError(
        `Failed to load superblock "${dashedName}": ${message}`,
        filePath
      ),
    };
  }
}

/**
 * Load a single block JSON file
 * @param dashedName Block identifier (e.g., "basic-html")
 * @param dataPath Absolute path to data/structure/ directory
 * @returns Result containing RawBlock or error with file path
 */
export async function loadBlockFile(
  dashedName: string,
  dataPath: string
): Promise<Result<RawBlock, DataValidationError>> {
  const filePath = path.join(dataPath, 'blocks', `${dashedName}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as RawBlock;
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: new DataValidationError(
        `Failed to load block "${dashedName}": ${message}`,
        filePath
      ),
    };
  }
}

/**
 * Load all superblock JSON files in parallel
 * @param superblockNames Array of superblock identifiers
 * @param dataPath Absolute path to data/structure/ directory
 * @returns Result containing Map of dashedName → RawSuperblock or first error
 */
export async function loadAllSuperblocks(
  superblockNames: readonly string[],
  dataPath: string
): Promise<Result<Map<string, RawSuperblock>, DataValidationError>> {
  const results = await Promise.all(
    superblockNames.map((name) => loadSuperblockFile(name, dataPath))
  );

  // Fail on first error (fail-fast approach)
  for (const result of results) {
    if (!result.success) {
      return result;
    }
  }

  // All succeeded - build Map
  const superblockMap = new Map<string, RawSuperblock>();
  for (let i = 0; i < superblockNames.length; i++) {
    const name = superblockNames[i];
    const result = results[i];
    if (name && result && result.success) {
      superblockMap.set(name, result.data);
    }
  }

  return { success: true, data: superblockMap };
}

/**
 * Load all block JSON files in parallel
 * @param blockNames Array of block identifiers
 * @param dataPath Absolute path to data/structure/ directory
 * @returns Result containing Map of dashedName → RawBlock or first error
 */
export async function loadAllBlocks(
  blockNames: readonly string[],
  dataPath: string
): Promise<Result<Map<string, RawBlock>, DataValidationError>> {
  const results = await Promise.all(
    blockNames.map((name) => loadBlockFile(name, dataPath))
  );

  // Fail on first error (fail-fast approach)
  for (const result of results) {
    if (!result.success) {
      return result;
    }
  }

  // All succeeded - build Map
  const blockMap = new Map<string, RawBlock>();
  for (let i = 0; i < blockNames.length; i++) {
    const name = blockNames[i];
    const result = results[i];
    if (name && result && result.success) {
      blockMap.set(name, result.data);
    }
  }

  return { success: true, data: blockMap };
}
