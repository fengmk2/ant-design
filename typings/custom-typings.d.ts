// https://github.com/facebook/create-react-app/blob/f09d3d3a52c1b938cecc977c2bbc0942ea0a7e70/packages/react-scripts/lib/react-app.d.ts#L42-L49
declare module '*.svg' {
  import type * as React from 'react';

  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;

  const src: string;
  export default src;
}

declare module 'jsonml-to-react-element';

declare module 'jsonml.js/*';

declare module '*.json' {
  const value: any;
  export const version: string;
  export default value;
}

// https://github.com/umijs/dumi/pull/2281
declare module '*.md' {
  const content: React.FC;
  export default content;
}

declare module '@npmcli/run-script' {
  export default function runScript(options: {
    [key: string]: string | string[] | boolean | NodeJS.ProcessEnv;
  }): Promise<void>;
}

declare module '@microflash/rehype-figure';

declare module 'dekko';

declare module 'csstree-validator';

// Vite import.meta.glob
interface ImportMeta {
  glob: <T = unknown>(
    pattern: string,
    options?: { eager?: boolean; import?: string },
  ) => Record<string, () => Promise<T>>;
}

// Google Analytics gtag
interface Window {
  gtag?: (command: string, action: string, params?: Record<string, any>) => void;
}

// Jest-Puppeteer globals for image tests (not yet migrated to Playwright)
declare const page: import('puppeteer').Page;
declare const jestPuppeteer: {
  debug: () => Promise<void>;
  resetPage: () => Promise<void>;
  resetBrowser: () => Promise<void>;
};
