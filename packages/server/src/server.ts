import { createYoga, createSchema } from 'graphql-yoga';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import type { DataProvider } from './data/types.js';
import { loadSchemaFile } from './schema/load-schema.js';
import { isReady } from './readiness.js';
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
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>freeCodeCamp Curriculum GraphQL API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(135deg, #0a0a23 0%, #1b1b32 100%);
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .container {
      max-width: 800px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 3rem;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      background: linear-gradient(90deg, #fff, #aaa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
      color: #fff;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
    }
    .subtitle {
      font-size: 1.2rem;
      color: #aaa;
      margin-bottom: 2rem;
    }
    .section {
      margin: 2rem 0;
    }
    .section h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #fff;
    }
    .link-card {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }
    .link-card:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
    .link-card h3 {
      color: #fff;
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
    }
    .link-card p {
      color: #aaa;
      margin-bottom: 0.75rem;
      line-height: 1.6;
    }
    .link-card a {
      display: inline-block;
      color: #3eeca8;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    .link-card a:hover {
      color: #2bc88d;
    }
    .code {
      background: rgba(0, 0, 0, 0.3);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: "Courier New", monospace;
      font-size: 0.9rem;
    }
    .footer {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      color: #888;
      font-size: 0.9rem;
    }
    .footer a {
      color: #3eeca8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Early Alpha</div>
    <h1>freeCodeCamp Curriculum GraphQL API</h1>
    <p class="subtitle">Access curriculum metadata for superblocks, blocks, and challenges</p>

    <div class="section">
      <h2>Getting Started</h2>
      <div class="link-card">
        <h3>GraphQL Playground</h3>
        <p>Interactive GraphiQL interface to explore and test queries</p>
        <a href="/graphql">Open GraphiQL →</a>
      </div>
      <div class="link-card">
        <h3>GraphQL Endpoint</h3>
        <p>Send POST requests to <span class="code">/graphql</span></p>
        <a href="/graphql" target="_blank">View Endpoint →</a>
      </div>
      <div class="link-card">
        <h3>GitHub Repository</h3>
        <p>View source code, contribute, and report issues</p>
        <a href="https://github.com/freeCodeCamp/curriculum-db" target="_blank">View on GitHub →</a>
      </div>
    </div>

    <div class="section">
      <h2>Statistics</h2>
      <div class="link-card">
        <p style="margin-bottom: 1rem;">The API provides access to the complete freeCodeCamp curriculum structure:</p>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: #3eeca8;">37</strong> <span style="color: #aaa;">Superblocks</span>
          </li>
          <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: #3eeca8;">38</strong> <span style="color: #aaa;">Chapters (v9 curriculum primitive)</span>
          </li>
          <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: #3eeca8;">217</strong> <span style="color: #aaa;">Modules (v9 curriculum primitive)</span>
          </li>
          <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: #3eeca8;">779</strong> <span style="color: #aaa;">Unique Blocks (deduplicated)</span>
          </li>
          <li style="padding: 0.5rem 0;">
            <strong style="color: #3eeca8;">14,038</strong> <span style="color: #aaa;">Challenges</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="section">
      <h2>Legacy Curriculum</h2>
      <div class="link-card">
        <h3>Hierarchical Structure</h3>
        <p>The new v9 curriculum introduces a three-level hierarchy:</p>
        <p style="margin-top: 0.5rem;"><span class="code">Superblock → Chapter → Module → Block</span></p>
        <p style="margin-top: 1rem; color: #ddd;">Query chapters and modules directly:</p>
        <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; line-height: 1.5; margin-top: 0.5rem;">
query {
  chapters(superblockDashedName: "full-stack-developer") {
    dashedName
    modules {
      dashedName
      blocks
    }
  }
}</pre>
      </div>
      <div class="link-card" style="margin-top: 1rem;">
        <h3>Block Sharing</h3>
        <p>In v9 curriculum, blocks can be shared across multiple superblocks. The API automatically deduplicates blocks and tracks all parent superblocks:</p>
        <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; line-height: 1.5; margin-top: 0.5rem;">
query {
  block(dashedName: "learn-html-by-building-a-cat-photo-app") {
    title
    superblocks {
      dashedName
      title
    }
  }
}</pre>
      </div>
    </div>

    <div class="section">
      <h2>Example Queries</h2>
      <div class="link-card">
        <h3>Get Curriculum Overview</h3>
        <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; line-height: 1.5;">
query {
  curriculum {
    superblocks
    certifications
  }
}</pre>
      </div>
      <div class="link-card">
        <h3>Explore a Superblock (Legacy)</h3>
        <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; line-height: 1.5;">
query {
  superblock(dashedName: "responsive-web-design") {
    title
    blocks
    challenges {
      id
      title
    }
  }
}</pre>
      </div>
      <div class="link-card">
        <h3>Query Modules by Chapter</h3>
        <pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; line-height: 1.5;">
query {
  modules(chapterDashedName: "html") {
    dashedName
    moduleType
    blockObjects {
      title
      challenges {
        id
        title
      }
    }
  }
}</pre>
      </div>
    </div>

    <div class="footer">
      <p>Built with ❤️ by <a href="https://www.freecodecamp.org" target="_blank">freeCodeCamp</a></p>
    </div>
  </div>
</body>
</html>`);
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
