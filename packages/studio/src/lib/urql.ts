'use client';

import { cacheExchange, createClient, fetchExchange } from 'urql';

const GRAPHQL_URL =
  process.env['NEXT_PUBLIC_GRAPHQL_URL'] ?? 'http://localhost:4000/graphql';

export const client = createClient({
  url: GRAPHQL_URL,
  exchanges: [cacheExchange, fetchExchange],
});
