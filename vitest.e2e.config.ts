import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['tests/e2e/**/*.spec.ts'], globalSetup: ['tests/e2e/global-setup.ts'], testTimeout: 60000, hookTimeout: 300000, fileParallelism: false },
});
