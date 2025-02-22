import React from "react";
import { Navbar } from "@mantine/core";

import { MenuItems } from "./menu-items";

export const LeftNav = () => {
  return (
    <Navbar p="xs" hiddenBreakpoint="sm" width={{ sm: 100, lg: 200 }}>
      <Navbar.Section grow mt="xs">
        <MenuItems />
      </Navbar.Section>
    </Navbar>
  );
};
