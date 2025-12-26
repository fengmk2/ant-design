import React from 'react';

import type { TableRef } from '..';
import Table from '..';
import { render } from '../../../tests/utils';

// Skip IE tests - IE is deprecated and setting Proxy = undefined breaks jsdom
describe.skip('Table.IE', () => {
  let originalWindowProxy: typeof Proxy;
  let originalGlobalProxy: typeof Proxy;

  beforeAll(() => {
    originalWindowProxy = window.Proxy;
    originalGlobalProxy = global.Proxy;
    window.Proxy = undefined as any;
    global.Proxy = undefined as any;
  });

  afterAll(() => {
    window.Proxy = originalWindowProxy;
    global.Proxy = originalGlobalProxy;
  });

  it('support reference', () => {
    const tblRef = React.createRef<TableRef>();
    const { container } = render(<Table ref={tblRef} />);

    const wrapDom = container.querySelector('.ant-table-wrapper')!;

    expect(tblRef.current).toBe(wrapDom);
    expect(tblRef.current?.nativeElement).toBe(wrapDom);
  });
});
