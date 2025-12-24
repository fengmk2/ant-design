import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
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
    environment: 'node',
    include: ['components/**/__tests__/**/node.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/_site/**'],
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    reporters: ['default'],
  },
});
