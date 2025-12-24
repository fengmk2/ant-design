import jsdom from 'jsdom';
import format, { plugins } from 'pretty-format';
import type { SnapshotSerializer } from 'vitest';

function cleanup(node: HTMLElement) {
  const childList = Array.from(node.childNodes);
  node.innerHTML = '';
  childList.forEach((child) => {
    if (!(child instanceof Text)) {
      node.appendChild(cleanup(child as HTMLElement));
    } else if (child.textContent) {
      node.appendChild(child);
    }
  });
  return node;
}

function formatHTML(nodes: any) {
  let cloneNodes: any;
  if (Array.isArray(nodes) || nodes instanceof HTMLCollection || nodes instanceof NodeList) {
    cloneNodes = Array.from(nodes).map((node) => cleanup(node.cloneNode(true) as HTMLElement));
  } else {
    cloneNodes = cleanup(nodes.cloneNode(true));
  }

  const htmlContent = format(cloneNodes, {
    plugins: [plugins.DOMCollection, plugins.DOMElement],
  });

  const filtered = htmlContent
    .split('\n')
    .filter((line) => line.trim())
    .join('\n');

  return filtered;
}

/**
 * HTMLElement snapshot serializer
 * React 17 & 18 will have different behavior in some special cases,
 * these diffs are nothing important in front end but will break in snapshot diff.
 */
export const htmlSerializer: SnapshotSerializer = {
  test: (element) =>
    typeof HTMLElement !== 'undefined' &&
    (element instanceof HTMLElement ||
      element instanceof DocumentFragment ||
      element instanceof HTMLCollection ||
      (Array.isArray(element) && element[0] instanceof HTMLElement)),
  serialize: (element) => formatHTML(element),
};

/**
 * Demo Test only accept render as SSR to make sure align with both `server` & `client` side
 */
export const demoSerializer: SnapshotSerializer = {
  test: (node) => node && typeof node === 'object' && node.type === 'demo' && node.html,
  serialize: ({ html }) => {
    const { JSDOM } = jsdom;
    const { document } = new JSDOM().window;
    document.body.innerHTML = html;

    const children = Array.from(document.body.childNodes).filter(
      (node) =>
        // Ignore `link` node since React 18 or below not support this
        node.nodeName !== 'LINK',
    );

    // Clean up `data-reactroot` since React 18 does not have this
    children.forEach((ele: any) => {
      if (typeof ele.removeAttribute === 'function') {
        ele.removeAttribute('data-reactroot');
      }
    });

    return formatHTML(children.length > 1 ? children : children[0]);
  },
};

// Default export as array of serializers for Vitest config
const serializers: SnapshotSerializer[] = [htmlSerializer, demoSerializer];

export default serializers;
