import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false, // Explicit imports preferred
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      exclude: [
        'dist/**',
        '**/*.config.*',
        '**/types.generated.ts',
        'src/__tests__/setup.ts',
        'src/__tests__/helpers.ts',
        'src/__tests__/fixtures.ts',
      ],
    },
  },
});
