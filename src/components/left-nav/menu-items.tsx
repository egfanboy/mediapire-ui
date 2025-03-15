import React from 'react';
import { IconBook2, IconSettings, IconTransferVertical } from '@tabler/icons-react';
import { MenuItem } from './menu-item';

const items = [
  {
    icon: <IconBook2 size="1rem" />,
    label: 'Media Library',
    href: '/library',
  },
  {
    icon: <IconSettings size="1rem" />,
    label: 'Manage',
    href: '/manage',
    items: [
      {
        icon: <IconTransferVertical size="1rem" />,

        label: 'Transfer Media',
        href: '/transfer',
      },
    ],
  },
];

export const MenuItems = () => {
  return (
    <div>
      {items.map((item) => (
        <MenuItem item={item} key={item.label}></MenuItem>
      ))}
    </div>
  );
};
