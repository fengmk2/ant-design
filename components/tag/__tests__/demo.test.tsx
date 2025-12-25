import * as React from 'react';

import demoTest, { rootPropsTest } from '../../../tests/shared/demoTest';

demoTest('tag', {
  // Skip animation.tsx: tween-one package has ESM import issues (relative imports without .js extension)
  skip: ['component-token.tsx', 'animation.tsx'],
});

rootPropsTest('tag', (Tag, props) => <Tag.CheckableTagGroup {...props} />, {
  name: 'Tag.CheckableTagGroup',
});
