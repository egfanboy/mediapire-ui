import React from 'react';
import { IconServer } from '@tabler/icons-react';
import { Group, Text, ThemeIcon, Tooltip, useMantineTheme } from '@mantine/core';
import { className } from '../../utils/class-names';
import styles from './node-item.module.css';

interface nodeItemProps {
  id: string;
  name: string;
  isUp: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
  tooltip?: string;
}

export const NodeItem = ({
  id,
  name,
  isUp,
  selected,
  onSelect,
  disabled = false,
  tooltip,
}: nodeItemProps) => {
  const mantineTheme = useMantineTheme();

  const getTooltip = () => {
    if (tooltip) {
      return tooltip;
    }

    if (!isUp) {
      return 'Mediapire cannot connect to node.';
    }
  };

  const content = () => (
    <div
      aria-disabled={isUp && !disabled ? 'false' : 'true'}
      className={className(styles.container, {
        [styles.containerSelected]: selected,
      })}
      style={
        {
          '--hover-color': mantineTheme.colors[mantineTheme.primaryColor][0],
          '--selected-color': mantineTheme.colors[mantineTheme.primaryColor][1],
        } as React.CSSProperties
      }
      onClick={() => isUp && onSelect(id)}
    >
      <Group className={styles.iconContainer}>
        <Text size="sm">{name}</Text>
        <ThemeIcon className={styles.icon} color={mantineTheme.colors.dark[0]}>
          <IconServer />
        </ThemeIcon>
        <span
          className={styles.badge}
          style={
            {
              '--badge-color': isUp ? mantineTheme.colors.green[8] : mantineTheme.colors.red[8],
            } as React.CSSProperties
          }
        ></span>
      </Group>
    </div>
  );

  if (!isUp || tooltip) {
    return <Tooltip label={getTooltip()}>{content()}</Tooltip>;
  }

  return content();
};
