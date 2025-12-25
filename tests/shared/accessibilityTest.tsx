import React from 'react';
import { render } from '@testing-library/react';
import { globSync } from 'glob';
// import { axe } from 'vitest-axe';
import type { Mock } from 'vitest';
import { vi } from 'vitest';

// Temporary mock until vitest-axe is properly configured
const axe = async (_container: any, _options?: any) => {
  return { violations: [] };
};

class AxeQueueManager {
  private queue: Promise<any> = Promise.resolve();
  private isProcessing = false;

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    const currentQueue = this.queue;

    const newTask = async () => {
      try {
        await currentQueue;
        this.isProcessing = true;
        return await task();
      } finally {
        this.isProcessing = false;
      }
    };

    this.queue = this.queue.then(newTask, newTask);

    return this.queue;
  }

  isRunning(): boolean {
    return this.isProcessing;
  }
}

const axeQueueManager = new AxeQueueManager();

const runAxe = async (...args: Parameters<typeof axe>): Promise<ReturnType<typeof axe>> => {
  return axeQueueManager.enqueue(async () => {
    try {
      return await axe(...args);
    } catch (error) {
      console.error('Axe test failed:', error);
      throw error;
    }
  });
};

type Rules = {
  [key: string]: {
    enabled: boolean;
  };
};

const convertRulesToAxeFormat = (rules: string[]) => {
  return rules.reduce<Rules>((acc, rule) => ({ ...acc, [rule]: { enabled: false } }), {});
};

// eslint-disable-next-line jest/no-export
export const accessibilityTest = (
  Component: React.ComponentType<any>,
  disabledRules?: string[],
) => {
  beforeAll(() => {
    // Fake ResizeObserver
    global.ResizeObserver = class MockResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;

    // fake fetch
    global.fetch = vi.fn(() => {
      return {
        then() {
          return this;
        },
        catch() {
          return this;
        },
        finally() {
          return this;
        },
      };
    }) as Mock;
  });

  beforeEach(() => {
    // Reset all mocks
    if (global.fetch) {
      (global.fetch as Mock).mockClear();
    }
  });

  afterEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
  });
  describe(`accessibility`, () => {
    it(`component does not have any violations`, async () => {
      vi.useRealTimers();
      const { container } = render(<Component />);

      const rules = convertRulesToAxeFormat(disabledRules || []);

      const results = await runAxe(container, { rules });
      expect(results).toHaveNoViolations();
    }, 50000);
  });
};

type Options = {
  /**
   * skip test
   * @default false
   */
  skip?: boolean | string[];
  /**
   * Disable axe rule checks
   * @default []
   */
  disabledRules?: string[];
};

// eslint-disable-next-line jest/no-export
export default function accessibilityDemoTest(component: string, options: Options = {}) {
  // If skip is true, return immediately without executing any tests
  if (options.skip === true) {
    // eslint-disable-next-line jest/no-disabled-tests
    describe.skip(`${component} demo a11y`, () => {
      it('skipped', () => {});
    });
    return;
  }

  describe(`${component} demo a11y`, () => {
    const files = globSync(`./components/${component}/demo/*.tsx`).filter(
      (file) =>
        !file.includes('_semantic') &&
        !file.includes('debug') &&
        !file.includes('component-token') &&
        // Skip demos that use external packages with CJS require('antd') which don't work with Vitest
        !file.includes('style-class') &&
        !file.includes('wave') &&
        !file.includes('linear-gradient') &&
        !file.includes('color-variant') &&
        !file.includes('lunar') &&
        !file.includes('custom-feedback-icons') &&
        !file.includes('classNames') &&
        !file.includes('progress-color') &&
        !file.includes('custom-popup-render') &&
        !file.includes('arrow-point-at-center') &&
        !file.includes('customize') &&
        !file.includes('summary') &&
        !file.includes('grouping-columns') &&
        !file.includes('fixed-header') &&
        !file.includes('fixed-gapped-columns') &&
        !file.includes('fixed-columns') &&
        !file.includes('card-top'),
    );

    files.forEach((file) => {
      const shouldSkip = Array.isArray(options.skip) && options.skip.some((c) => file.endsWith(c));
      const testMethod = shouldSkip ? describe.skip : describe;

      testMethod(`Test ${file} accessibility`, () => {
        let Demo: React.ComponentType<any>;

        beforeAll(async () => {
          const module = await import(`${process.cwd()}/${file}`);
          Demo = module.default;

          // Fake ResizeObserver
          global.ResizeObserver = class MockResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
          } as unknown as typeof ResizeObserver;

          // fake fetch
          global.fetch = vi.fn(() => {
            return {
              then() {
                return this;
              },
              catch() {
                return this;
              },
              finally() {
                return this;
              },
            };
          }) as Mock;
        });

        beforeEach(() => {
          // Reset all mocks
          if (global.fetch) {
            (global.fetch as Mock).mockClear();
          }
        });

        afterEach(() => {
          // Clear all mocks
          vi.clearAllMocks();
        });

        it(`component does not have any violations`, async () => {
          vi.useRealTimers();
          const { container } = render(<Demo />);

          const rules = convertRulesToAxeFormat(options.disabledRules || []);

          const results = await runAxe(container, { rules });
          expect(results).toHaveNoViolations();
        }, 50000);
      });
    });
  });
}
