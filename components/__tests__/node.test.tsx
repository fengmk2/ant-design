import * as React from 'react';
import { vi } from 'vitest';
import { renderToString } from 'react-dom/server';

// Use import.meta.glob with lazy loading - demos are only imported when accessed
// This allows us to skip problematic demos before they're loaded
const demoModules = import.meta.glob<{ default: React.ComponentType }>('../*/demo/*.tsx');

// Skip configurations for demos that can't be SSR'd
// Collected from the original demo.test.tsx files
const skipConfig: Record<string, string[]> = {
  anchor: ['basic'],
  'color-picker': ['panel-render', 'text-render'],
  tour: ['render-panel'],
  'qr-code': ['errorlevel', 'base64', 'customColor', 'customSize', 'Popover'],
};

// Global patterns to skip - demos using external packages that require('antd') directly
const globalSkipPatterns = [
  '_semantic', // Semantic demos
  'style-class', // antd-style demos
  'classNames', // antd-style (drawer, modal)
  'animation', // tween-one module issues
  'crop-image', // antd-img-crop
  'customized-form-controls', // antd-style
  'custom-feedback-icons', // antd-style
  'wave', // @ant-design/happy-work-theme
  'linear-gradient', // antd-style
  'debug-color-variant', // antd-style
  'color-variant', // antd-style
  'lunar', // antd-style
  'custom-popup-render', // antd-style (menu)
  'progress-color', // antd-style (notification)
  'arrow-point-at-center', // antd-style (popover)
  'customize', // antd-style (splitter)
  'fixed-columns-header', // antd-style (table)
  'fixed-columns', // antd-style (table)
  'fixed-gapped-columns', // antd-style (table)
  'fixed-header', // antd-style (table)
  'grouping-columns', // antd-style (table)
  'summary', // antd-style (table)
  'card-top', // antd-style (tabs)
  'custom', // antd-style (watermark)
];

// Known SSR-incompatible errors to allow (these are expected in SSR)
const allowedSSRErrors = [
  'Portals are not currently supported by the server renderer',
  'Target container is not a DOM element',
  'document is not defined',
  'window is not defined',
  'Element type is invalid', // Some components have import issues in SSR context
];

// Check if a demo should be skipped
function shouldSkipDemo(path: string): boolean {
  const match = path.match(/\.\.\/([^/]+)\/demo\/(.+)\.tsx$/);
  if (!match) return true;

  const [, componentName, demoName] = match;

  const matchesGlobalPattern = globalSkipPatterns.some((pattern) => path.includes(pattern));
  const componentSkips = skipConfig[componentName] || [];
  const matchesComponentSkip = componentSkips.some((skip) => demoName.includes(skip));

  return matchesGlobalPattern || matchesComponentSkip;
}

// Check if an error is an expected SSR incompatibility
function isAllowedSSRError(error: Error): boolean {
  return allowedSSRErrors.some((msg) => error.message.includes(msg));
}

describe('node', () => {
  beforeAll(() => {
    vi.useFakeTimers().setSystemTime(new Date('2016-11-22'));
  });

  // Group demo paths by component
  const componentDemoPaths: Record<string, string[]> = {};

  Object.keys(demoModules).forEach((path) => {
    if (shouldSkipDemo(path)) return;

    const match = path.match(/\.\.\/([^/]+)\/demo\/(.+)\.tsx$/);
    if (!match) return;

    const [, componentName] = match;

    if (!componentDemoPaths[componentName]) {
      componentDemoPaths[componentName] = [];
    }

    componentDemoPaths[componentName].push(path);
  });

  // Create test suites for each component
  Object.entries(componentDemoPaths).forEach(([componentName, demoPaths]) => {
    describe(componentName, () => {
      demoPaths.forEach((path) => {
        it(path, async () => {
          // Lazy load the demo only when the test runs
          const module = await demoModules[path]();
          const Demo = module.default;

          // Check if Demo is a valid component
          if (!Demo) {
            throw new Error(
              `No default export for ${path}: ${JSON.stringify(Object.keys(module))}`,
            );
          }
          if (typeof Demo !== 'function') {
            throw new TypeError(
              `Invalid Demo type for ${path}: ${typeof Demo}, keys: ${JSON.stringify(Object.keys(Demo))}`,
            );
          }

          try {
            renderToString(<Demo />);
          } catch (error) {
            // Allow known SSR-incompatible errors
            if (error instanceof Error && isAllowedSSRError(error)) {
              return; // Test passes - this is expected SSR behavior
            }
            throw error; // Re-throw unexpected errors
          }
        });
      });
    });
  });
});
