import { vi } from 'vitest';

import { extendTest } from '../../../tests/shared/demoTest';

vi.mock('../.', async () => {
  const OriReact = await vi.importActual<typeof import('react')>('react');
  const OriTourModule = await vi.importActual<typeof import('../.')>('../.');
  const OriTour = OriTourModule.default;

  const ProxyTour = OriReact.forwardRef((props: any, ref: any) =>
    OriReact.createElement(OriTour, { ...props, open: true, ref }),
  );

  return { default: ProxyTour };
});

extendTest('tour', { skip: ['render-panel.tsx'] });
