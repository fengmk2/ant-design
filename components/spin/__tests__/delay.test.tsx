import React from 'react';
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { debounce } from 'throttle-debounce';

import Spin from '..';
import { waitFakeTimer } from '../../../tests/utils';

vi.mock('throttle-debounce');
(debounce as ReturnType<typeof vi.fn>).mockImplementation((...args: any[]) =>
  vi.importActual('throttle-debounce').debounce(...args),
);

describe('delay spinning', () => {
  it("should render with delay when it's mounted with spinning=true and delay", () => {
    const { container } = render(<Spin spinning delay={500} />);
    expect(container.querySelector('.ant-spin')).not.toHaveClass('ant-spin-spinning');
  });

  it('should render when delay is init set', async () => {
    vi.useFakeTimers();
    const { container } = render(<Spin spinning delay={100} />);

    expect(container.querySelector('.ant-spin-spinning')).toBeFalsy();

    await waitFakeTimer();

    expect(container.querySelector('.ant-spin-spinning')).toBeTruthy();

    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should cancel debounce function when unmount', () => {
    const debouncedFn = vi.fn();
    const cancel = vi.fn();
    (debouncedFn as any).cancel = cancel;
    (debounce as ReturnType<typeof vi.fn>).mockReturnValueOnce(debouncedFn);
    const { unmount } = render(<Spin spinning delay={100} />);

    expect(cancel).not.toHaveBeenCalled();
    unmount();
    expect(cancel).toHaveBeenCalled();
  });

  it('should close immediately', async () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<Spin spinning delay={500} />);

    await waitFakeTimer();
    expect(container.querySelector('.ant-spin-spinning')).toBeTruthy();

    rerender(<Spin spinning={false} delay={500} />);
    expect(container.querySelector('.ant-spin-spinning')).toBeFalsy();
  });
});
