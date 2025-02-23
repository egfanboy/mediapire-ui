import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Collapse,
  Group,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { CollapsibleArrow } from '../collapsible-arrow/collapsible-arrow';
import styles from './menu-item.module.css';

interface menuItemProps {
  item: any;
  parentItem?: any;
}

export const MenuItem = ({ item, parentItem }: menuItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    if (location.pathname.startsWith(item.href) && location.pathname !== item.href) {
      const hasChildren = item.items?.length;

      setExpanded(hasChildren);
    }
  }, []);

  const hasChildren = item.items?.length;

  const href = (parentItem?.href || '') + item.href;

  const isActive =
    location.pathname === href ||
    // support routes that have fragments after the path but are not their own route
    (!hasChildren && location.pathname.startsWith(href));

  const content = () => (
    <>
      <UnstyledButton
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={styles.menuItem}
        style={{
          '--primary-color': theme.colors[theme.primaryColor][0],
          '--color': isActive
            ? theme.colors[theme.primaryColor]
            : colorScheme === 'dark'
              ? theme.colors.dark[0]
              : theme.black,
          '--padding-left': parentItem ? (item.icon ? theme.spacing.xs : theme.spacing.lg) : 0,
        }}
        // sx={(theme) => ({
        //   display: "block",
        //   width: "100%",
        //   paddingTop: theme.spacing.xs,
        //   paddingBottom: theme.spacing.xs,
        //   paddingLeft: parentItem
        //     ? item.icon
        //       ? theme.spacing.xs
        //       : theme.spacing.lg
        //     : 0,

        //   borderRadius: theme.radius.sm,
        // color: isActive
        //   ? theme.colors[theme.primaryColor]
        //   : theme.colorScheme === "dark"
        //   ? theme.colors.dark[0]
        //   : theme.black,

        //   "&:hover": {
        //     backgroundColor: theme.colors[theme.primaryColor][0],
        //   },
        // })}
      >
        <Group>
          {item.icon && <ThemeIcon variant="light">{item.icon}</ThemeIcon>}

          <Text size="sm">{item.label}</Text>
          {hasChildren && <CollapsibleArrow collapsed={!expanded} />}
        </Group>
      </UnstyledButton>
      {hasChildren && (
        <Collapse in={expanded}>
          <div>
            {item.items.map((it: any) => (
              <MenuItem key={item.label + it.label} item={it} parentItem={item} />
            ))}
          </div>
        </Collapse>
      )}
    </>
  );

  if (hasChildren) {
    return <div>{content()}</div>;
  }

  return (
    <Link style={{ textDecoration: 'none' }} to={href}>
      {content()}
    </Link>
  );
};
