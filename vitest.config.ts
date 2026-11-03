import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx,mjs}', 'src/**/*.test.{ts,tsx,mjs}'],
    coverage: {
      provider: 'v8',
      include: ['src/features/**/*.ts', 'src/services/**/*.ts'],
      reporter: ['text', 'html'],
      thresholds: { lines: 60, functions: 60, branches: 50 },
    },
  },
});
