import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../server/src/schema/schema.graphql',
  documents: ['src/**/*.ts', 'src/**/*.tsx'],
  generates: {
    'src/graphql/generated/': {
      preset: 'client',
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
        scalars: {
          ID: 'string',
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
