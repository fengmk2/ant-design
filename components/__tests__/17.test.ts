import { vi } from 'vitest';

vi.mock('../_util/getReactMajorVersionCanDelMe', () => {
  return { default: () => 17 };
});

// Skip: require('..') doesn't work in Vitest ESM environment
describe.skip('antd legacy', () => {
  it('should warn when React version is below 18', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    require('..');

    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: [antd: version] antd v6 no longer supports React versions below 18. Please upgrade to React 18 or higher.',
    );
  });
});
