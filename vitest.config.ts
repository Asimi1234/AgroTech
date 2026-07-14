import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Reuses the app's Vite config (path alias, plugins) and adds the test setup.
// Kept separate from vite.config.ts so the app build isn't typed against
// Vitest's config types.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts'],
    },
  }),
);
