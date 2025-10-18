import { initializeDataStore, InMemoryDataProvider } from './index.js';
import path from 'path';

// Determine data path (repository root is two levels up from packages/server)
const dataPath = path.resolve(process.cwd(), '..', '..', 'data', 'structure');

console.log('Loading curriculum data from:', dataPath);
const startTime = Date.now();

const result = await initializeDataStore(dataPath);

const elapsed = Date.now() - startTime;

if (!result.success) {
  console.error('❌ Failed to load data:');
  console.error('  Error:', result.error.message);
  console.error('  File:', result.error.filePath);
  if (result.error.field) {
    console.error('  Field:', result.error.field);
  }
  process.exit(1);
}

const provider = new InMemoryDataProvider(result.data);
const curriculum = provider.getCurriculum();

console.log('✅ Success!');
console.log('  Superblocks:', curriculum.superblocks.length);
console.log('  Certifications:', curriculum.certifications.length);
console.log('  Blocks:', result.data.blocks.size);
console.log('  Challenges:', result.data.challenges.size);
console.log('  Load time:', elapsed, 'ms');

// Memory usage
const used = process.memoryUsage();
console.log('  Heap used:', Math.round(used.heapUsed / 1024 / 1024), 'MB');

// Performance validation
if (elapsed > 1000) {
  console.warn('⚠️  Warning: Load time exceeded 1 second target');
}

if (used.heapUsed > 50 * 1024 * 1024) {
  console.warn('⚠️  Warning: Memory usage exceeded 50MB target');
}
