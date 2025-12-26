import React from 'react';
import type { MenuProps } from '../../menu';
import Dropdown from '..';
import { SaveOutlined } from '@ant-design/icons';
import { render } from '../../../tests/utils';

describe('Dropdown.Semantic', () => {
  it('support classNames and styles', () => {
    const items: MenuProps['items'] = [
      {
        key: '1',
        type: 'group',
        label: 'Group title',
        children: [
          {
            key: '1-1',
            label: '1st menu item',
            icon: <SaveOutlined />,
          },
          {
            key: '1-2',
            label: '2nd menu item',
            icon: <SaveOutlined />,
          },
        ],
      },
      {
        key: 'SubMenu',
        label: 'SubMenu',
        children: [
          {
            key: 'g1',
            label: 'Item 1',
            type: 'group',
            children: [
              { key: '1', label: 'Option 1' },
              { key: '2', label: 'Option 2' },
            ],
          },
        ],
      },
    ];
    const testClassNames = {
      root: 'test-root',
      itemTitle: 'test-menu-item-title',
      item: 'test-menu-item',
      itemContent: 'test-menu-item-content',
      itemIcon: 'test-menu-item-icon',
    };
    const testStyles = {
      root: { backgroundColor: 'rgb(0, 0, 255)' },
      itemTitle: { color: 'rgb(255, 0, 0)' },
      item: { backgroundColor: 'rgb(0, 255, 0)' },
      itemContent: { color: 'rgb(255, 255, 0)' },
      itemIcon: { fontSize: '20px' },
    };
    render(
      <Dropdown menu={{ items }} open classNames={testClassNames} styles={testStyles}>
        <button type="button">button</button>
      </Dropdown>,
    );
    // Query document.body for portal-rendered dropdown content
    const root = document.body.querySelector('.ant-dropdown');
    const item = document.body.querySelector('.ant-dropdown-menu-item');
    const itemIcon = document.body.querySelector('.ant-dropdown-menu-item-icon');
    const itemContent = document.body.querySelector('.ant-dropdown-menu-title-content');
    const itemTitle = document.body.querySelector('.ant-dropdown-menu-item-group-title');

    expect(root).toHaveClass(testClassNames.root);
    expect(root).toHaveStyle(testStyles.root);
    expect(item).toHaveClass(testClassNames.item);
    expect(item).toHaveStyle(testStyles.item);
    expect(itemIcon).toHaveClass(testClassNames.itemIcon);
    expect(itemIcon).toHaveStyle(testStyles.itemIcon);
    expect(itemContent).toHaveClass(testClassNames.itemContent);
    expect(itemContent).toHaveStyle(testStyles.itemContent);
    expect(itemTitle).toHaveClass(testClassNames.itemTitle);
    expect(itemTitle).toHaveStyle(testStyles.itemTitle);
  });
});
