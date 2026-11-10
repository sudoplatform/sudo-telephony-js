import { defineConfig } from 'vitest/config'

export default defineConfig({
  server: {
    sourcemapIgnoreList: (sourcePath) => sourcePath.includes('node_modules'),
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/lib/**', '**/cjs/**', '**/types/**'],
    setupFiles: ['./vitest.setup.ts'],
    clearMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', '**/*.d.ts', 'node_modules/**'],
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './build/coverage',
    },
    testTimeout: 240000,
    hookTimeout: 240000,
  },
})
