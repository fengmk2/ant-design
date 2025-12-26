import type { Plugin } from 'vite';

/**
 * Vite plugin to handle demo markdown files for testing.
 * This replaces the @ant-design/tools/lib/jest/demoPreprocessor functionality.
 *
 * The original Jest preprocessor:
 * 1. Extracts demo code from markdown files
 * 2. Creates a module that exports the demo component
 *
 * For Vitest, demos are loaded dynamically via require() in test files,
 * so this plugin primarily ensures markdown files can be processed.
 */
export function demoPlugin(): Plugin {
  return {
    name: 'antd-demo-plugin',
    enforce: 'pre',

    transform(code: string, id: string) {
      // Handle markdown demo files
      if (id.endsWith('.md')) {
        // For markdown files, we return a simple module that can be imported
        // The actual demo extraction happens in the test utilities
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: null,
        };
      }

      return null;
    },
  };
}

/**
 * Vite plugin to handle image assets for testing.
 * This replaces the @ant-design/tools/lib/jest/imagePreprocessor functionality.
 */
export function imagePlugin(): Plugin {
  return {
    name: 'antd-image-plugin',
    enforce: 'pre',

    transform(_code: string, id: string) {
      // Handle image files
      if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(id)) {
        // Return the file path as default export
        return {
          code: `export default ${JSON.stringify(id)};`,
          map: null,
        };
      }

      return null;
    },
  };
}

export default { demoPlugin, imagePlugin };
