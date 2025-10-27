#!/usr/bin/env node

/**
 * Fetch curriculum data from freeCodeCamp repository
 * For local development: copies from sibling freeCodeCamp repo
 * For Docker/CI: uses git sparse-checkout
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir, rm, cp, readdir, access } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

async function fetchData() {
  console.log('Fetching curriculum data from freeCodeCamp repository...\n');

  const dataDir = join(rootDir, 'data', 'structure');
  const localRepoPath = join(rootDir, '..', 'freeCodeCamp', 'curriculum', 'structure');

  try {
    await mkdir(join(dataDir, 'blocks'), { recursive: true });
    await mkdir(join(dataDir, 'superblocks'), { recursive: true });

    // Try to copy from local freeCodeCamp repo first (for development)
    try {
      await access(localRepoPath);
      console.log('Found local freeCodeCamp repository, copying data...');

      await cp(join(localRepoPath, 'curriculum.json'), join(dataDir, 'curriculum.json'));
      await cp(join(localRepoPath, 'blocks'), join(dataDir, 'blocks'), { recursive: true });
      await cp(join(localRepoPath, 'superblocks'), join(dataDir, 'superblocks'), { recursive: true });

      const superblocks = await readdir(join(dataDir, 'superblocks'));
      const blocks = await readdir(join(dataDir, 'blocks'));
      const superblockCount = superblocks.filter((f) => f.endsWith('.json')).length;
      const blockCount = blocks.filter((f) => f.endsWith('.json')).length;

      console.log(`\n${colors.green}✓ Curriculum data copied successfully${colors.reset}\n`);
      console.log('Copied:');
      console.log('  - curriculum.json');
      console.log(`  - ${superblockCount} superblock files`);
      console.log(`  - ${blockCount} block files\n`);

      return;
    } catch {
      // Local repo not available, fall back to git
      console.log('Local freeCodeCamp repository not found, using git...');
    }

    // Fallback: Use git sparse-checkout (for Docker/CI)
    const tempDir = join(rootDir, 'data', 'temp-curriculum');

    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true });
    }

    console.log('Cloning curriculum structure files with git sparse-checkout...');

    await execAsync(`git clone --filter=blob:none --sparse https://github.com/freeCodeCamp/freeCodeCamp.git ${tempDir}`);
    await execAsync(`cd ${tempDir} && git sparse-checkout set curriculum/structure`);

    const structureDir = join(tempDir, 'curriculum', 'structure');

    if (!existsSync(structureDir)) {
      throw new Error('Structure directory not found after git clone');
    }

    // Copy files
    await cp(join(structureDir, 'curriculum.json'), join(dataDir, 'curriculum.json'));
    await cp(join(structureDir, 'blocks'), join(dataDir, 'blocks'), { recursive: true });
    await cp(join(structureDir, 'superblocks'), join(dataDir, 'superblocks'), { recursive: true });

    // Clean up temp directory
    await rm(tempDir, { recursive: true, force: true });

    const superblocks = await readdir(join(dataDir, 'superblocks'));
    const blocks = await readdir(join(dataDir, 'blocks'));
    const superblockCount = superblocks.filter((f) => f.endsWith('.json')).length;
    const blockCount = blocks.filter((f) => f.endsWith('.json')).length;

    console.log(`\n${colors.green}✓ Curriculum data fetched successfully${colors.reset}\n`);
    console.log('Downloaded:');
    console.log('  - curriculum.json');
    console.log(`  - ${superblockCount} superblock files`);
    console.log(`  - ${blockCount} block files\n`);
  } catch (error) {
    console.error('Error fetching curriculum data:', error.message);

    // Clean up on error
    const tempDir = join(rootDir, 'data', 'temp-curriculum');
    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true });
    }

    process.exit(1);
  }
}

fetchData();
