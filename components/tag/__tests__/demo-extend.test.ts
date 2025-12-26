import { extendTest } from '../../../tests/shared/demoTest';

extendTest('tag', {
  // Skip animation.tsx: tween-one package has ESM import issues
  skip: ['component-token.tsx', 'draggable.tsx', 'animation.tsx'],
});
