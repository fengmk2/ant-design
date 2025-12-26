import React from 'react';
import { vi } from 'vitest';

import { render } from '../../../tests/utils';
import SliderTooltip from '../SliderTooltip';

let mockForceAlign: ReturnType<typeof vi.fn>;

vi.mock('../../tooltip', async () => {
  const ReactReal: typeof React = await vi.importActual('react');
  return {
    __esModule: true,
    default: ReactReal.forwardRef((props: any, ref: any) => {
      ReactReal.useImperativeHandle(ref, () => ({
        forceAlign: mockForceAlign,
      }));
      return <div {...props} />;
    }),
  };
});

describe('SliderTooltip', () => {
  beforeEach(() => {
    mockForceAlign = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('calls forceAlign when mergedOpen is true and value changes', () => {
    const { rerender } = render(<SliderTooltip open draggingDelete={false} value={1} />);

    vi.runAllTimers();
    expect(mockForceAlign).toHaveBeenCalledTimes(1);

    rerender(<SliderTooltip open draggingDelete={false} value={2} />);
    vi.runAllTimers();
    expect(mockForceAlign).toHaveBeenCalledTimes(2);
  });

  it('does not call forceAlign when mergedOpen is false and value changes', () => {
    const { rerender } = render(<SliderTooltip open={false} value={1} />);

    vi.runAllTimers();
    expect(mockForceAlign).not.toHaveBeenCalled();

    rerender(<SliderTooltip open={false} value={2} />);
    vi.runAllTimers();
    expect(mockForceAlign).not.toHaveBeenCalled();

    rerender(<SliderTooltip open draggingDelete value={3} />);
    vi.runAllTimers();
    expect(mockForceAlign).not.toHaveBeenCalled();
  });
});
