import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'shared',
          root: 'packages/shared',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'daemon',
          root: 'packages/daemon',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'cli',
          root: 'packages/cli',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        extends: 'packages/web/vite.config.ts',
        test: {
          name: 'web',
          root: 'packages/web',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['src/test-setup.ts'],
        },
      },
    ],
  },
})
