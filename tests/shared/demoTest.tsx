import path from 'path';
import * as React from 'react';
import { createCache, StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import { globSync } from 'glob';
import 'isomorphic-fetch';
import kebabCase from 'lodash/kebabCase';
import { renderToString } from 'react-dom/server';
import { vi } from 'vitest';

import { resetWarned } from '../../components/_util/warning';
import { render } from '../utils';
import { TriggerMockContext } from './demoTestContext';
import { excludeWarning, isSafeWarning } from './excludeWarning';
import rootPropsTest from './rootPropsTest';

export { rootPropsTest };

export type Options = {
  skip?: boolean | string[];
  testingLib?: boolean;
  testRootProps?: false | object;
  /**
   * Not check component `displayName`, check path only
   */
  nameCheckPathOnly?: boolean;
};

function baseTest(doInject: boolean, component: string, options: Options = {}) {
  const files = globSync(`./components/${component}/demo/*.tsx`).filter(
    (file) =>
      !file.includes('_semantic') &&
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
    // to compatible windows path
    file = file.split(path.sep).join('/');
    const testMethod =
      options.skip === true ||
      (Array.isArray(options.skip) && options.skip.some((c) => file.includes(c)))
        ? test.skip
        : test;

    // function doTest(name: string, openTrigger = false) {
    testMethod(
      doInject ? `renders ${file} extend context correctly` : `renders ${file} correctly`,
      async () => {
        resetWarned();

        const errSpy = excludeWarning();

        Date.now = vi.fn(() => new Date('2016-11-22').getTime());
        vi.useFakeTimers().setSystemTime(new Date('2016-11-22'));

        const module = await import(`${process.cwd()}/${file}`);
        let Demo = module.default;
        // Inject Trigger status unless skipped
        Demo = typeof Demo === 'function' ? <Demo /> : Demo;
        if (doInject) {
          Demo = (
            <TriggerMockContext.Provider value={{ popupVisible: true }}>
              {Demo}
            </TriggerMockContext.Provider>
          );
        }

        // Inject cssinjs cache to avoid create <style /> element
        Demo = (
          <ConfigProvider theme={{ hashed: false }}>
            <StyleProvider cache={createCache()}>{Demo}</StyleProvider>
          </ConfigProvider>
        );

        // Demo Test also include `dist` test which is already uglified.
        // We need test this as SSR instead.
        if (doInject) {
          const { container } = render(Demo);
          expect({ type: 'demo', html: container.innerHTML }).toMatchSnapshot();
        } else {
          const html = renderToString(Demo);
          expect({ type: 'demo', html }).toMatchSnapshot();
        }

        vi.clearAllTimers();

        // Snapshot of warning info
        if (doInject) {
          const errorMessageSet = new Set(errSpy.mock.calls.map((args) => args[0]));
          const errorMessages = Array.from(errorMessageSet)
            .filter((msg) => !isSafeWarning(msg, true))
            .sort();

          // Console log the error messages for debugging
          if (errorMessages.length) {
            console.log(errSpy.mock.calls);
          }

          expect(errorMessages).toMatchSnapshot();
        }

        errSpy.mockRestore();
      },
    );
    vi.useRealTimers();
  });
}

/**
 * Inject Trigger to force open in test snapshots
 */
export function extendTest(component: string, options: Options = {}) {
  baseTest(true, component, options);
}

/**
 * Test all the demo snapshots
 */
export default function demoTest(component: string, options: Options = {}) {
  baseTest(false, component, options);

  // Test component name is match the kebab-case
  const testName = test;
  testName('component name is match the kebab-case', async () => {
    const kebabName = kebabCase(component);

    // Path should exist
    const module = await import(`${process.cwd()}/components/${kebabName}/index.tsx`);
    const Component: React.ComponentType<any> = module.default;

    if (options.nameCheckPathOnly !== true && Component.displayName) {
      expect(kebabCase(Component.displayName).replace(/^deprecated-/, '')).toBe(kebabName);
    }
  });

  if (options?.testRootProps !== false) {
    rootPropsTest(component, null!, {
      props: options?.testRootProps,
    });
  }
}
