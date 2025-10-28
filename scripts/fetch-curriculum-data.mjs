#!/usr/bin/env node

/**
 * Fetch curriculum data from freeCodeCamp repository using giget
 * Always fetches from GitHub to ensure reliability and parity
 */

import { downloadTemplate } from 'giget';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

async function fetchData() {
  console.log(
    `${colors.blue}Fetching curriculum data from freeCodeCamp repository...${colors.reset}\n`
  );

  const dataDir = join(rootDir, 'data', 'structure');

  try {
    console.log('Downloading from GitHub...\n');

    await downloadTemplate('gh:freeCodeCamp/freeCodeCamp/curriculum/structure', {
      dir: dataDir,
      force: true,
      offline: false,
    });

    // Verify and report
    const superblocks = await readdir(join(dataDir, 'superblocks'));
    const blocks = await readdir(join(dataDir, 'blocks'));
    const superblockCount = superblocks.filter((f) =>
      f.endsWith('.json')
    ).length;
    const blockCount = blocks.filter((f) => f.endsWith('.json')).length;

    console.log(
      `\n${colors.green}✓ Curriculum data fetched successfully${colors.reset}\n`
    );
    console.log('Downloaded:');
    console.log('  - curriculum.json');
    console.log(`  - ${superblockCount} superblock files`);
    console.log(`  - ${blockCount} block files\n`);
  } catch (error) {
    console.error(
      `\n${colors.yellow}Error fetching curriculum data:${colors.reset}`,
      error.message
    );
    process.exit(1);
  }
}

fetchData();
