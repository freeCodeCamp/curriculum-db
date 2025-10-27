import { initializeDataStore } from './data/index.js';
import { InMemoryDataProvider } from './data/provider.js';
import { createGraphQLServer } from './server.js';
import { setStartTime } from './uptime.js';

async function main() {
  console.log('Starting GraphQL server...\n');

  // Load configuration from environment
  const PORT = parseInt(process.env.PORT ?? '4000', 10);
  const DATA_PATH = process.env.DATA_PATH ?? '../../data/structure';
  const CORS_ORIGIN =
    process.env.NODE_ENV === 'production'
      ? (process.env.CORS_ORIGIN ?? '*')
      : '*';

  // Validate configuration
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    console.error(`Error: Invalid PORT value: ${process.env.PORT}`);
    console.error('PORT must be an integer between 1 and 65535');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production' && CORS_ORIGIN === '*') {
    console.error('Error: CORS_ORIGIN must be explicitly set in production');
    process.exit(1);
  }

  // Initialize data store
  console.log(`Loading curriculum data from: ${DATA_PATH}`);
  const result = await initializeDataStore(DATA_PATH);

  if (!result.success) {
    console.error('\nError: Failed to load curriculum data');
    console.error('Details:', result.error.message);
    if ('filePath' in result.error) {
      console.error(
        'File:',
        (result.error as Error & { filePath: string }).filePath
      );
    }
    console.error('\nStack trace:');
    console.error(result.error.stack);
    process.exit(1);
  }

  const dataStore = result.data;
  const dataProvider = new InMemoryDataProvider(dataStore);

  // Mark server as ready (start uptime tracking)
  setStartTime(Date.now());

  // Create and start server
  const server = createGraphQLServer(dataProvider, {
    port: PORT,
    corsOrigin: CORS_ORIGIN,
  });

  try {
    await server.start();

    // Calculate stats for success message
    const curriculum = dataProvider.getCurriculum();
    const superblockCount = curriculum.superblocks.length;

    let blockCount = 0;
    for (const sbName of curriculum.superblocks) {
      const sb = dataProvider.getSuperblock(sbName);
      if (sb) blockCount += sb.blocks.length;
    }

    let challengeCount = 0;
    for (const sbName of curriculum.superblocks) {
      const sb = dataProvider.getSuperblock(sbName);
      if (sb) {
        for (const blockName of sb.blocks) {
          const block = dataProvider.getBlock(blockName);
          if (block) challengeCount += block.challenges.length;
        }
      }
    }

    const memoryMB =
      Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;

    console.log(`\n✓ Server started successfully on port ${PORT}`);
    console.log(`  GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`\n  Loaded curriculum data:`);
    console.log(`  - ${superblockCount} superblocks`);
    console.log(`  - ${blockCount} blocks`);
    console.log(`  - ${challengeCount} challenges`);
    console.log(`  - Memory usage: ${memoryMB} MB`);
    console.log(`\n  CORS origin: ${CORS_ORIGIN}`);
    console.log(`\n  Ready to accept GraphQL requests!\n`);
  } catch (error) {
    console.error('\nError: Failed to start server');
    if (error instanceof Error) {
      console.error('Details:', error.message);
      if ('code' in error && error.code === 'EADDRINUSE') {
        console.error(`\nPort ${PORT} is already in use.`);
        console.error('Try setting a different PORT environment variable.');
      }
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error:');
  console.error(error);
  process.exit(1);
});
