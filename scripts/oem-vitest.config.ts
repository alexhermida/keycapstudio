import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['scripts/oem-compare.test.ts'] },
});
