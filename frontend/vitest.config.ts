import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors tsconfig.json's "paths": { "@/*": ["./*"] } — TypeScript's path mapping
    // is a compiler-only hint and isn't read by Vite's own resolver, so routes using the
    // "@/..." alias (Task 7 onward) need this explicit alias or Vitest can't resolve them.
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Vitest's default include glob (**/*.{test,spec}.ts) would otherwise pick up
    // tests/smoke.spec.ts (Task 11) and try to run it as a Vitest suite, which fails
    // because it calls Playwright's test(). Playwright specs use its own runner.
    exclude: [...configDefaults.exclude, 'tests/smoke.spec.ts'],
  },
});
