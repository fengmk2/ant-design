import accessibilityDemoTest from '../../../tests/shared/accessibilityTest';

// Skip animation.tsx: tween-one package has ESM import issues
accessibilityDemoTest('tag', { skip: ['animation.tsx'] });
