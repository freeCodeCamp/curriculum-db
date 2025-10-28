import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { GraphQLServer } from '../server.js';
import { createGraphQLServer } from '../server.js';
import { getTestDataStore } from './setup.js';
import { InMemoryDataProvider } from '../data/provider.js';
import { setReady } from '../readiness.js';

describe('Server Creation and Configuration', () => {
  let server: GraphQLServer;
  let dataProvider: InMemoryDataProvider;

  beforeAll(async () => {
    const store = await getTestDataStore();
    dataProvider = new InMemoryDataProvider(store);
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.httpServer.close(() => resolve());
      });
    }
  });

  describe('createGraphQLServer()', () => {
    it('should create server with valid configuration', () => {
      server = createGraphQLServer(dataProvider, {
        port: 4001,
        corsOrigin: '*',
      });

      expect(server).toBeDefined();
      expect(server.httpServer).toBeDefined();
      expect(server.yoga).toBeDefined();
      expect(server.start).toBeDefined();
      expect(typeof server.start).toBe('function');
    });

    it('should create server with custom CORS origin', () => {
      const customServer = createGraphQLServer(dataProvider, {
        port: 4002,
        corsOrigin: 'https://freecodecamp.org',
      });

      expect(customServer).toBeDefined();
      expect(customServer.httpServer).toBeDefined();

      customServer.httpServer.close();
    });

    it('should handle landing page GET requests', async () => {
      server = createGraphQLServer(dataProvider, {
        port: 4003,
        corsOrigin: '*',
      });

      await server.start();

      const response = await fetch('http://localhost:4003/');
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');

      const html = await response.text();
      expect(html).toContain('freeCodeCamp Curriculum GraphQL API');
      expect(html).toContain('GraphiQL');
    });

    it('should serve GraphQL endpoint at /graphql', async () => {
      server = createGraphQLServer(dataProvider, {
        port: 4004,
        corsOrigin: '*',
      });

      await server.start();

      // Test introspection query
      const response = await fetch('http://localhost:4004/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '{ __typename }',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeDefined();
      expect(data.data.__typename).toBe('Query');
    });

    it('should provide GraphiQL interface on GET to /graphql', async () => {
      server = createGraphQLServer(dataProvider, {
        port: 4005,
        corsOrigin: '*',
      });

      await server.start();

      const response = await fetch('http://localhost:4005/graphql', {
        headers: {
          Accept: 'text/html',
        },
      });
      expect(response.status).toBe(200);

      const html = await response.text();
      expect(html).toContain('GraphiQL');
    });

    it('should handle CORS preflight requests', async () => {
      server = createGraphQLServer(dataProvider, {
        port: 4006,
        corsOrigin: 'https://freecodecamp.org',
      });

      await server.start();

      const response = await fetch('http://localhost:4006/graphql', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://freecodecamp.org',
          'Access-Control-Request-Method': 'POST',
        },
      });

      expect(response.headers.get('access-control-allow-origin')).toBe(
        'https://freecodecamp.org'
      );
    });

    it('should provide context with DataProvider methods', async () => {
      server = createGraphQLServer(dataProvider, {
        port: 4007,
        corsOrigin: '*',
      });

      await server.start();

      // Query that uses context methods
      const response = await fetch('http://localhost:4007/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              curriculum {
                superblocks
              }
            }
          `,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeDefined();
      expect(data.data.curriculum).toBeDefined();
      expect(data.data.curriculum.superblocks).toBeInstanceOf(Array);
    });

    it('should handle invalid GraphQL queries gracefully', async () => {
      server = createGraphQLServer(dataProvider, {
        port: 4008,
        corsOrigin: '*',
      });

      await server.start();

      const response = await fetch('http://localhost:4008/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'query { invalidField }',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.errors).toBeDefined();
      expect(data.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Health Check Endpoints', () => {
    beforeAll(async () => {
      // Set readiness state for this test suite
      setReady(true);

      server = createGraphQLServer(dataProvider, {
        port: 4010,
        corsOrigin: '*',
      });

      await server.start();
    });

    describe('/health endpoint', () => {
      it('should return 200 OK for liveness probe', async () => {
        const response = await fetch('http://localhost:4010/health');
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain(
          'application/json'
        );

        const data = await response.json();
        expect(data).toEqual({ status: 'ok' });
      });

      it('should respond with JSON status', async () => {
        const response = await fetch('http://localhost:4010/health');
        const data = await response.json();

        expect(data).toHaveProperty('status');
        expect(data.status).toBe('ok');
      });

      it('should be accessible from any origin', async () => {
        const response = await fetch('http://localhost:4010/health', {
          headers: {
            Origin: 'https://example.com',
          },
        });
        expect(response.status).toBe(200);
      });
    });

    describe('/ready endpoint', () => {
      it('should return 200 when server is ready', async () => {
        const response = await fetch('http://localhost:4010/ready');
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain(
          'application/json'
        );

        const data = await response.json();
        expect(data).toEqual({ status: 'ready' });
      });

      it('should respond with JSON status when ready', async () => {
        const response = await fetch('http://localhost:4010/ready');
        const data = await response.json();

        expect(data).toHaveProperty('status');
        expect(data.status).toBe('ready');
      });

      it('should be accessible from any origin', async () => {
        const response = await fetch('http://localhost:4010/ready', {
          headers: {
            Origin: 'https://example.com',
          },
        });
        expect(response.status).toBe(200);
      });

      it('should return 503 when server is not ready', async () => {
        // Temporarily set readiness to false
        setReady(false);

        const response = await fetch('http://localhost:4010/ready');
        expect(response.status).toBe(503);
        expect(response.headers.get('content-type')).toContain(
          'application/json'
        );

        const data = await response.json();
        expect(data).toEqual({ status: 'not ready' });

        // Restore ready state for other tests
        setReady(true);
      });

      it('should transition from not ready to ready', async () => {
        // Set not ready
        setReady(false);
        let response = await fetch('http://localhost:4010/ready');
        expect(response.status).toBe(503);

        // Set ready
        setReady(true);
        response = await fetch('http://localhost:4010/ready');
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Landing Page Content', () => {
    beforeAll(async () => {
      server = createGraphQLServer(dataProvider, {
        port: 4009,
        corsOrigin: '*',
      });

      await server.start();
    });

    it('should include API endpoints in landing page', async () => {
      const response = await fetch('http://localhost:4009/');
      const html = await response.text();

      expect(html).toContain('/graphql');
      expect(html).toContain('GraphiQL');
    });

    it('should include example queries in landing page', async () => {
      const response = await fetch('http://localhost:4009/');
      const html = await response.text();

      expect(html).toContain('curriculum');
      expect(html).toContain('superblock');
      expect(html).toContain('block');
      expect(html).toContain('challenge');
    });

    it('should be mobile responsive', async () => {
      const response = await fetch('http://localhost:4009/');
      const html = await response.text();

      expect(html).toContain('viewport');
      expect(html).toContain('width=device-width');
    });
  });
});
