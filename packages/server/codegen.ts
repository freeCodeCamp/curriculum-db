import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/schema/schema.graphql',
  generates: {
    './src/schema/types.generated.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        // Type mappers - connect GraphQL types to internal types
        mappers: {
          Curriculum: '../data/types.js#CurriculumData',
          Superblock: '../data/types.js#SuperblockData',
          Chapter: '../data/types.js#ChapterData',
          Module: '../data/types.js#ModuleData',
          Block: '../data/types.js#BlockData',
          Challenge: '../data/types.js#ChallengeMetadata', // Critical: Metadata only!
          Certification: '../data/types.js#CertificationData',
          // RequiredResource uses generated type (simple structure, no mapping needed)
        },

        // Enum mappers - reference existing enums
        enumValues: {
          BlockLayout: '../data/types.js#BlockLayout',
          BlockLabel: '../data/types.js#BlockLabel',
        },

        // Context type for all resolvers
        contextType: '../data/types.js#DataProvider',

        // Type safety settings
        useIndexSignature: false, // No [key: string]: any
        strictScalars: true, // Validate scalar types
        scalars: {
          ID: 'string',
        },

        // Additional options
        skipTypename: true,
        avoidOptionals: {
          field: false,
          inputValue: false,
          object: true,
        },
      },
    },
  },
};

export default config;
