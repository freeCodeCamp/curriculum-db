import { createYoga, createSchema } from 'graphql-yoga';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DataProvider } from './data/types.js';
import { loadSchemaFile } from './schema/load-schema.js';
import { isReady } from './readiness.js';
import { resolvers } from './schema/resolvers/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadLandingPage(): string {
  const landingPath = join(__dirname, 'landing.html');
  return readFileSync(landingPath, 'utf-8');
}

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
    graphiql: {
      title: 'freeCodeCamp Curriculum API',
      defaultQuery: `# Welcome to freeCodeCamp Curriculum GraphQL API
# Query curriculum metadata for superblocks, blocks, and challenges

# Get detailed data from a block including challenges
query GetBlockWithChallenges {
  block(dashedName: "basic-html-and-html5") {
    title
    dashedName
    order
    challenges {
      id
      title
      dashedName
      description
      instructions
      superBlock
      block
    }
  }
}

# Get superblock structure
query GetSuperblockStructure {
  superblock(dashedName: "responsive-web-design") {
    title
    dashedName
    blocks
  }
}`,
    },
  });

  // Health check handlers
  const requestHandler = (req: IncomingMessage, res: ServerResponse) => {
    // Liveness probe - simple health check
    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    // Readiness probe - checks if data is loaded and ready to serve traffic
    if (req.url === '/ready' && req.method === 'GET') {
      if (isReady()) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ready' }));
      } else {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'not ready' }));
      }
      return;
    }

    // Landing page
    if (req.url === '/' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(loadLandingPage());
      return;
    }

    // Pass all other requests to GraphQL Yoga
    yoga(req, res);
  };

  const httpServer = createServer(requestHandler);

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
