import React from 'react';
import { vi } from 'vitest';
import { spyElementPrototypes } from '@rc-component/util/lib/test/domHook';
import { render } from '@testing-library/react';

import { resetWarned } from '../../_util/warning';
import { createEvent, fireEvent } from '../../../tests/utils';
import { AggregationColor } from '../color';
import ColorPicker from '../ColorPicker';

describe('ColorPicker.gradient', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeAll(() => {
    spyElementPrototypes(HTMLElement, {
      getBoundingClientRect: () => ({
        width: 100,
        height: 100,
        left: 0,
        top: 0,
        bottom: 100,
        right: 100,
      }),
    });
  });

  beforeEach(() => {
    resetWarned();
    vi.useFakeTimers();
  });

  afterEach(() => {
    errorSpy.mockReset();
    vi.useRealTimers();
  });

  function doMouseDown(
    container: HTMLElement | Document,
    start: number,
    query: string | HTMLElement = '.ant-slider-handle',
    skipEventCheck = false,
  ) {
    // Query document.body for portal-rendered popup content
    const ele = typeof query === 'object' ? query : document.body.querySelector(query)!;
    const mouseDown = createEvent.mouseDown(ele);
    Object.defineProperty(mouseDown, 'pageX', { value: start });
    Object.defineProperty(mouseDown, 'pageY', { value: start });

    const preventDefault = vi.fn();

    Object.defineProperties(mouseDown, {
      clientX: { get: () => start },
      clientY: { get: () => start },
      preventDefault: { value: preventDefault },
    });

    fireEvent.mouseEnter(ele);
    fireEvent(ele, mouseDown);

    // Should not prevent default since focus will not change
    if (!skipEventCheck) {
      expect(preventDefault).not.toHaveBeenCalled();
    }

    fireEvent.focus(ele);
  }

  function doMouseMove(end: number) {
    const mouseMove = createEvent.mouseMove(document);
    Object.defineProperty(mouseMove, 'pageX', { value: end });
    Object.defineProperty(mouseMove, 'pageY', { value: end });
    fireEvent(document, mouseMove);
  }

  function doDrag(
    container: HTMLElement | Document,
    start: number,
    end: number,
    query: string | HTMLElement = '.ant-slider-handle',
    skipEventCheck = false,
  ) {
    doMouseDown(container, start, query, skipEventCheck);

    // Drag
    doMouseMove(end);

    // Up - Query document.body for portal-rendered popup content
    fireEvent.mouseUp(typeof query === 'object' ? query : document.body.querySelector(query)!);
  }

  it('switch', async () => {
    const onChange = vi.fn();

    render(
      <ColorPicker mode={['single', 'gradient']} defaultValue="#123456" open onChange={onChange} />,
    );

    // Switch to gradient - Query document.body for portal-rendered popup content
    fireEvent.click(document.body.querySelectorAll(`.ant-segmented-item-input`)[1]);

    expect(onChange).toHaveBeenCalledWith(
      expect.anything(),
      'linear-gradient(90deg, rgb(18,52,86) 0%, rgb(18,52,86) 100%)',
    );
  });

  it('change color position', async () => {
    const onChange = vi.fn();

    render(
      <ColorPicker
        mode={['single', 'gradient']}
        defaultValue={[
          {
            color: '#FF0000',
            percent: 0,
          },
          {
            color: '#0000FF',
            percent: 100,
          },
        ]}
        open
        onChange={onChange}
      />,
    );

    // Move - Use document.body for portal-rendered popup content
    doDrag(document.body, 0, 80);

    expect(onChange).toHaveBeenCalledWith(
      expect.anything(),
      'linear-gradient(90deg, rgb(255,0,0) 80%, rgb(0,0,255) 100%)',
    );
  });

  it('change color hex', async () => {
    const onChange = vi.fn();

    render(
      <ColorPicker
        mode={['single', 'gradient']}
        defaultValue={[
          {
            color: '#FF0000',
            percent: 0,
          },
          {
            color: '#0000FF',
            percent: 100,
          },
        ]}
        open
        onChange={onChange}
      />,
    );

    // Move - Query document.body for portal-rendered popup content
    doDrag(
      document.body,
      0,
      80,
      document.body.querySelector<HTMLElement>(
        '.ant-color-picker-slider-container .ant-slider-handle',
      )!,
      true,
    );

    expect(onChange).toHaveBeenCalledWith(
      expect.anything(),
      'linear-gradient(90deg, rgb(200,0,255) 0%, rgb(0,0,255) 100%)',
    );
  });

  it('new color', async () => {
    const onChange = vi.fn();

    render(
      <ColorPicker
        mode={['single', 'gradient']}
        defaultValue={[
          {
            color: '#FF0000',
            percent: 0,
          },
          {
            color: '#0000FF',
            percent: 100,
          },
        ]}
        open
        onChange={onChange}
      />,
    );

    // Move - Use document.body for portal-rendered popup content
    doDrag(document.body, 20, 30, '.ant-slider', true);

    expect(onChange).toHaveBeenCalledWith(
      expect.anything(),
      'linear-gradient(90deg, rgb(255,0,0) 0%, rgb(204,0,51) 20%, rgb(0,0,255) 100%)',
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.anything(),
      'linear-gradient(90deg, rgb(255,0,0) 0%, rgb(204,0,51) 30%, rgb(0,0,255) 100%)',
    );
  });

  it('remove color', async () => {
    const onChange = vi.fn();

    render(
      <ColorPicker
        mode={['single', 'gradient']}
        defaultValue={[
          {
            color: '#FF0000',
            percent: 0,
          },
          {
            color: '#00FF00',
            percent: 50,
          },
          {
            color: '#000FF0',
            percent: 80,
          },
          {
            color: '#0000FF',
            percent: 100,
          },
        ]}
        open
        onChange={onChange}
      />,
    );

    // Delete remove first - Query document.body for portal-rendered popup content
    fireEvent.keyDown(document.body.querySelector<HTMLElement>('.ant-slider-handle-1')!, {
      key: 'Delete',
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.anything(),
      'linear-gradient(90deg, rgb(0,255,0) 50%, rgb(0,15,240) 80%, rgb(0,0,255) 100%)',
    );

    // Drag remove last - Query document.body for portal-rendered popup content
    onChange.mockReset();
    doDrag(
      document.body,
      0,
      9999999,
      document.body.querySelector<HTMLElement>('.ant-slider-handle-3')!,
      true,
    );

    expect(onChange).toHaveBeenCalledWith(
      expect.anything(),
      'linear-gradient(90deg, rgb(0,255,0) 50%, rgb(0,15,240) 80%)',
    );
  });

  it('invalid not crash', async () => {
    render(<ColorPicker mode={['single', 'gradient']} defaultValue={[]} open />);
  });

  it('change to single', async () => {
    const onChange = vi.fn();

    render(
      <ColorPicker
        mode={['single', 'gradient']}
        defaultValue={[
          {
            color: '#FF0000',
            percent: 0,
          },
          {
            color: '#0000FF',
            percent: 100,
          },
        ]}
        open
        onChange={onChange}
      />,
    );

    // Switch to gradient - Query document.body for portal-rendered popup content
    fireEvent.click(document.body.querySelector(`.ant-segmented-item-input`)!);

    expect(onChange).toHaveBeenCalledWith(expect.anything(), 'rgb(255,0,0)');
  });

  it('not crash when pass gradient color', async () => {
    const color = new AggregationColor([
      {
        color: '#FF0000',
        percent: 0,
      },
    ]);

    const newColor = new AggregationColor(color);
    expect(newColor.toCssString()).toEqual('linear-gradient(90deg, rgb(255,0,0) 0%)');
  });

  it('mode fallback', () => {
    render(<ColorPicker mode={['gradient']} defaultValue="#F00" open />);

    // Query document.body for portal-rendered popup content
    expect(document.body.querySelector('.ant-color-picker-gradient-slider')).toBeTruthy();
  });

  // This test case may easily break by jsdom update
  // https://github.com/ant-design/ant-design/issues/51159
  it('change color 2 should not be color 1', () => {
    render(
      <ColorPicker
        mode={['gradient']}
        open
        defaultValue={[
          {
            color: '#FF0000',
            percent: 0,
          },
          {
            color: '#0000FF',
            percent: 100,
          },
        ]}
      />,
    );

    // Select second one - Query document.body for portal-rendered popup content
    const handle2 = document.body.querySelector<HTMLElement>('.ant-slider-handle-2')!;
    doDrag(document.body, 0, 0, handle2, true);

    // Drag in the color panel - Query document.body for portal-rendered popup content
    const panelHandle = document.body.querySelector('.ant-color-picker-saturation')!;
    const mouseDown = createEvent.mouseDown(panelHandle);
    fireEvent(panelHandle, mouseDown);

    expect(handle2).not.toHaveStyle({
      backgroundColor: 'rgb(255,0,0)',
    });
  });

  it('preset color', () => {
    const onChange = vi.fn();

    render(
      <ColorPicker
        mode={['gradient']}
        open
        presets={[
          {
            label: 'Liner',
            colors: [
              [
                {
                  color: '#FF0000',
                  percent: 0,
                },
                {
                  color: '#0000FF',
                  percent: 100,
                },
              ],
            ],
          },
        ]}
        onChange={onChange}
      />,
    );

    expect(document.querySelector('.ant-color-picker-presets-color-checked')).toBeFalsy();

    // Select preset
    fireEvent.click(
      document.querySelector('.ant-color-picker-presets .ant-color-picker-color-block-inner')!,
    );
    const color = onChange.mock.calls[0][0];
    expect(color.toCssString()).toEqual(
      'linear-gradient(90deg, rgb(255,0,0) 0%, rgb(0,0,255) 100%)',
    );
    expect(document.querySelector('.ant-color-picker-presets-color-checked')).toBeTruthy();
  });
});
