import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Cast to any to avoid type mismatch between vitest's rollup types and @vitejs/plugin-react types
  plugins: [react()] as any,
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
    include: ['**/**/check-site.{ts,js}'],
    exclude: ['**/node_modules/**'],
    testTimeout: 10000,
    hookTimeout: 10000,
    reporters: ['default'],
  },
});
