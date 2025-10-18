import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load GraphQL schema from schema.graphql file
 * @returns Schema as string for GraphQL Yoga
 */
export function loadSchemaFile(): string {
  const schemaPath = resolve(__dirname, './schema.graphql');
  return readFileSync(schemaPath, 'utf-8');
}
