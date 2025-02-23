import React from 'react';
import { AppShell, AppShellNavbar } from '@mantine/core';
import { MenuItems } from './menu-items';

export const LeftNav = () => {
  return (
    <AppShellNavbar p="xs">
      <AppShell.Section grow mt="xs">
        <MenuItems />
      </AppShell.Section>
    </AppShellNavbar>
  );
};
