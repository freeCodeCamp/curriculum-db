import { createYoga, createSchema } from 'graphql-yoga';
import { createServer } from 'node:http';
import type { DataProvider } from './data/types.js';
import { loadSchemaFile } from './schema/load-schema.js';
import { resolvers } from './schema/resolvers/index.js';

export interface ServerConfig {
  readonly port: number;
  readonly corsOrigin: string;
}

export interface GraphQLServer {
  readonly httpServer: ReturnType<typeof createServer>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly yoga: any; // GraphQL Yoga internal types are complex and external
  readonly start: () => Promise<void>;
}

export function createGraphQLServer(
  dataProvider: DataProvider,
  config: ServerConfig
): GraphQLServer {
  const typeDefs = loadSchemaFile();

  const schema = createSchema({
    typeDefs,
    resolvers,
  });

  // Create a context factory that ensures all DataProvider methods are properly bound
  const contextFactory = () => {
    return {
      getCurriculum: () => dataProvider.getCurriculum(),
      getSuperblock: (dashedName: string) =>
        dataProvider.getSuperblock(dashedName),
      getBlock: (dashedName: string) => dataProvider.getBlock(dashedName),
      getChallenge: (id: string) => dataProvider.getChallenge(id),
    };
  };

  const yoga = createYoga({
    schema,
    graphqlEndpoint: '/graphql',
    context: contextFactory,
    cors: {
      origin: config.corsOrigin,
      credentials: true,
    },
  });

  // Type assertion needed because Yoga's handler signature doesn't match http.RequestListener exactly
  const httpServer = createServer(yoga as Parameters<typeof createServer>[0]);

  return {
    httpServer,
    yoga,
    start: () => {
      return new Promise<void>((resolve, reject) => {
        try {
          httpServer.listen(config.port, () => {
            resolve();
          });
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    },
  };
}
