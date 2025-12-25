import * as React from 'react';
import { vi } from 'vitest';

import { extendTest } from '../../../tests/shared/demoTest';

vi.mock('@rc-component/drawer', async () => {
  const Drawer = await vi.importActual<any>('@rc-component/drawer');
  const MockDrawer = Drawer.default;
  return {
    default: (props: any) => {
      const newProps = {
        ...props,
        open: true,
        getContainer: false,
        maskMotion: null,
        motion: null,
      };
      return <MockDrawer {...newProps} />;
    },
  };
});

extendTest('drawer', {
  testingLib: true,
});
