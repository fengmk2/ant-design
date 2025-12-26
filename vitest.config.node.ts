import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import { demoPlugin, imagePlugin } from './scripts/vite-plugins/demoPlugin';

// Modules that need to be compiled (ESM -> CJS)
const compileModules = [
  'react-sticky-box',
  'rc-tween-one',
  'tween-one',
  '@babel',
  '@ant-design',
  'countup.js',
  '.pnpm',
  '@asamuzakjp/css-color',
  '@rc-component',
  'parse5',
];

export default defineConfig({
  plugins: [react(), demoPlugin(), imagePlugin()],
  resolve: {
    alias: [
      // Handle antd/es/* and antd/lib/* imports
      { find: /^antd\/es\/(.*)$/, replacement: resolve(__dirname, './components/$1') },
      { find: /^antd\/lib\/(.*)$/, replacement: resolve(__dirname, './components/$1') },
      { find: /^antd\/locale\/(.*)$/, replacement: resolve(__dirname, './components/locale/$1') },
      { find: 'antd', replacement: resolve(__dirname, './components/index') },
    ],
  },
  test: {
    globals: true,
    // Use jsdom for SSR tests because node environment doesn't properly resolve
    // TypeScript imports without extensions
    environment: 'jsdom',
    include: ['components/**/__tests__/**/node.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/_site/**'],
    setupFiles: ['./tests/setup.ts', './tests/setupAfterEnv.ts', 'vitest-canvas-mock'],
    testTimeout: 30000,
    hookTimeout: 30000,
    reporters: ['default'],
    // Force all test files and deps to go through Vite's transform pipeline
    server: {
      deps: {
        inline: [/.*/],
      },
    },
    deps: {
      interopDefault: true,
      optimizer: {
        web: {
          include: compileModules,
        },
      },
    },
  },
});
