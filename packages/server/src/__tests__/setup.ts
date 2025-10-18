import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { createYoga, createSchema } from 'graphql-yoga';
import type { ExecutionResult, DocumentNode } from 'graphql';
import { loadSchemaFile } from '../schema/load-schema.js';
import { resolvers } from '../schema/resolvers/index.js';
import { initializeDataStore, InMemoryDataProvider } from '../data/index.js';
import type { DataStore, DataProvider } from '../data/types.js';
import { setStartTime } from '../uptime.js';

let cachedDataStore: DataStore | null = null;
let cachedDataProvider: DataProvider | null = null;

/**
 * GraphQL executor interface for testing
 */
export interface GraphQLExecutor {
  execute<TData = any, TVariables extends Record<string, any> = Record<string, any>>(request: {
    document: DocumentNode;
    variables?: TVariables;
    operationName?: string;
  }): Promise<ExecutionResult<TData>>;
}

/**
 * Initialize and cache the DataStore for tests
 * @returns DataStore instance
 */
async function getCachedDataStore(): Promise<DataStore> {
  if (!cachedDataStore) {
    const result = await initializeDataStore('../../data/structure');
    if (!result.success) {
      throw new Error(`Failed to initialize DataStore: ${result.error.message}`);
    }
    cachedDataStore = result.data;
    cachedDataProvider = new InMemoryDataProvider(cachedDataStore);

    // Set uptime for tests
    setStartTime(Date.now());
  }
  return cachedDataStore;
}

/**
 * Get the cached DataProvider for tests
 * @returns DataProvider instance
 */
async function getCachedDataProvider(): Promise<DataProvider> {
  if (!cachedDataProvider) {
    await getCachedDataStore(); // Initializes both
  }
  return cachedDataProvider!;
}

/**
 * Create a GraphQL executor for testing queries
 * Uses in-memory fetch() simulation (no actual network requests)
 * @returns GraphQLExecutor instance
 */
export async function createTestExecutor(): Promise<GraphQLExecutor> {
  const dataProvider = await getCachedDataProvider();

  const typeDefs = loadSchemaFile();
  const schema = createSchema({
    typeDefs,
    resolvers,
  });

  // Create context factory that matches production server
  const contextFactory = () => {
    return {
      getCurriculum: () => dataProvider.getCurriculum(),
      getSuperblock: (dashedName: string) => dataProvider.getSuperblock(dashedName),
      getBlock: (dashedName: string) => dataProvider.getBlock(dashedName),
      getChallenge: (id: string) => dataProvider.getChallenge(id),
    };
  };

  const yoga = createYoga({
    schema,
    context: contextFactory
  });

  const executor = buildHTTPExecutor({
    fetch: yoga.fetch.bind(yoga),
    endpoint: 'http://yoga/graphql'
  });

  return {
    execute: async <TData = any, TVariables extends Record<string, any> = Record<string, any>>(request: {
      document: DocumentNode;
      variables?: TVariables;
      operationName?: string;
    }): Promise<ExecutionResult<TData>> => {
      const executorRequest = {
        document: request.document,
        ...(request.operationName && { operationName: request.operationName }),
        ...(request.variables && { variables: request.variables })
      };
      return executor(executorRequest) as Promise<ExecutionResult<TData>>;
    }
  };
}

/**
 * Get direct access to the DataStore for inspection
 * @returns DataStore instance (read-only access)
 */
export async function getTestDataStore(): Promise<DataStore> {
  return getCachedDataStore();
}
