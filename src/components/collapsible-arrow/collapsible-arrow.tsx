import React from 'react';
import { className } from '../../utils/class-names';
import styles from './collapsible-arrow.module.css';

interface collapsibleArrowProps {
  collapsed: boolean;
}

export const CollapsibleArrow = ({ collapsed }: collapsibleArrowProps) => {
  return (
    <i
      className={className(styles.arrow, {
        [styles.collapsed]: collapsed,
        [styles.expanded]: !collapsed,
      })}
    ></i>
  );
};
