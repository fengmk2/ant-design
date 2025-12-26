import notification, { actWrapper } from '..';
import { act, fireEvent } from '../../../tests/utils';
import type { ArgsProps, GlobalConfigProps } from '../interface';
import { awaitPromise, triggerMotionEnd } from './util';

// TODO: Remove this. Mock for React 19
vi.mock('react-dom', async () => {
  const realReactDOM = await vi.importActual<typeof import('react-dom')>('react-dom');

  if (realReactDOM.version.startsWith('19')) {
    const realReactDOMClient =
      await vi.importActual<typeof import('react-dom/client')>('react-dom/client');
    return { ...realReactDOM, createRoot: realReactDOMClient.createRoot };
  }

  return realReactDOM;
});

describe('Notification.placement', () => {
  function open(args?: Partial<ArgsProps>) {
    notification.open({
      title: 'Notification Title',
      description: 'This is the content of the notification.',
      ...args,
    });
  }

  function config(args: Partial<GlobalConfigProps>) {
    notification.config({
      ...args,
    });

    act(() => {
      open();
    });
  }

  beforeAll(() => {
    actWrapper(act);
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    // Clean up
    notification.destroy();
    await triggerMotionEnd();

    notification.config({
      prefixCls: undefined,
      getContainer: undefined,
    });

    vi.useRealTimers();

    await awaitPromise();
  });

  describe('placement', () => {
    it('can be configured globally using the `config` method', async () => {
      // topLeft
      config({
        placement: 'topLeft',
        top: 50,
        bottom: 50,
      });
      await awaitPromise();

      expect(document.querySelector('.ant-notification-topLeft')).toHaveStyle({
        top: '50px',
        left: '0px',
        bottom: 'auto',
      });

      // topRight
      config({
        placement: 'topRight',
        top: 100,
        bottom: 50,
      });

      expect(document.querySelector('.ant-notification-topRight')).toHaveStyle({
        top: '100px',
        right: '0px',
        bottom: 'auto',
      });

      // bottomRight
      config({
        placement: 'bottomRight',
        top: 50,
        bottom: 100,
      });

      expect(document.querySelector('.ant-notification-bottomRight')).toHaveStyle({
        top: 'auto',
        right: '0px',
        bottom: '100px',
      });

      // bottomLeft
      config({
        placement: 'bottomLeft',
        top: 100,
        bottom: 50,
      });

      expect(document.querySelector('.ant-notification-bottomLeft')).toHaveStyle({
        top: 'auto',
        left: '0px',
        bottom: '50px',
      });

      // top
      config({
        placement: 'top',
        top: 50,
        bottom: 60,
      });
      await awaitPromise();

      expect(document.querySelector('.ant-notification-top')).toHaveStyle({
        top: '50px',
        left: '50%',
        bottom: 'auto',
      });

      // bottom
      config({
        placement: 'bottom',
        top: 50,
        bottom: 60,
      });
      await awaitPromise();

      expect(document.querySelector('.ant-notification-bottom')).toHaveStyle({
        top: 'auto',
        left: '50%',
        bottom: '60px',
      });
    });
  });

  describe('mountNode', () => {
    const $container = document.createElement('div');
    beforeEach(() => {
      document.body.appendChild($container);
    });
    afterEach(() => {
      $container.remove();
    });

    it('can be configured globally using the `config` method', async () => {
      config({
        getContainer: () => $container,
      });
      await awaitPromise();

      expect($container.querySelector('.ant-notification')).toBeTruthy();
      notification.destroy();

      // Leave motion
      act(() => {
        vi.runAllTimers();
      });
      document.querySelectorAll('.ant-notification-notice-wrapper').forEach((ele) => {
        fireEvent.animationEnd(ele);
      });
      expect($container.querySelector('.ant-notification')).toBeFalsy();

      // Upcoming notifications are mounted in $container
      act(() => {
        open();
      });
      expect($container.querySelector('.ant-notification')).toBeTruthy();
    });
  });
});
