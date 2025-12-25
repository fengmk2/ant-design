import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import { demoPlugin, imagePlugin } from './scripts/vite-plugins/demoPlugin';

// Modules that need to be compiled (ESM -> CJS)
const compileModules = [
  'react-sticky-box',
  'rc-tween-one',
  '@babel',
  '@ant-design',
  'countup.js',
  '.pnpm',
  '@asamuzakjp/css-color',
  '@rc-component',
  'parse5',
  'jsdom',
  'jest-axe',
  'axe-core',
];

export default defineConfig({
  plugins: [react(), demoPlugin(), imagePlugin()],
  resolve: {
    alias: {
      antd: resolve(__dirname, './components/index'),
      'antd/es': resolve(__dirname, './components'),
      'antd/lib': resolve(__dirname, './components'),
      'antd/locale': resolve(__dirname, './components/locale'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['components/**/__tests__/**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/node.test.{ts,tsx}',
      '**/image.test.{ts,tsx}',
      '**/type.test.{ts,tsx}',
      '**/_site/**',
    ],
    setupFiles: ['./tests/setup.ts', './tests/setupAfterEnv.ts', 'vitest-canvas-mock'],
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    pool: 'threads',
    isolate: true,
    coverage: {
      provider: 'v8',
      include: ['components/**/*.{ts,tsx}'],
      exclude: [
        'components/*/style/index.tsx',
        'components/style/index.tsx',
        'components/*/locale/index.tsx',
        'components/*/__tests__/type.test.tsx',
        'components/**/*/interface.{ts,tsx}',
        'components/*/__tests__/image.test.{ts,tsx}',
        'components/__tests__/node.test.tsx',
        'components/*/demo/*.tsx',
        'components/*/design/**',
      ],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    reporters: ['default'],
    // Handle deps that need to be inlined for transformation
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
