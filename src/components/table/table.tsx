import React, { useCallback } from 'react';
import { IconDots } from '@tabler/icons-react';
import { ActionIcon, Checkbox, Menu, Table as MTable } from '@mantine/core';

type withId = { id: string };

type column<T> = {
  getValue?: (item: T, key: string) => string;
  label: string;
  key: string;
};

interface TableProps<T extends withId> {
  items: T[];
  showSelection: boolean;
  selectedItems: string[];
  showSelectAll: boolean;
  onSelectAll?: () => any;
  bulkActions?: { label: string; handler: (...args: any[]) => void }[];
  columns: column<T>[];
  onItemSelected: (id: string) => void;
  classes?: {
    table?: string;
    header?: string;
    body?: string;
    selectAllCheckbox?: string;
  };
}

export const Table = <T extends withId>({
  classes,
  items,
  showSelectAll,
  selectedItems,
  onSelectAll,
  bulkActions,
  columns,
  showSelection,
  onItemSelected,
}: TableProps<T>) => {
  const ba = bulkActions || [];
  const renderRow = useCallback(
    (item: T) => {
      return (
        <MTable.Tr key={item.id}>
          {showSelection && (
            <MTable.Td>
              <Checkbox
                checked={!!selectedItems.includes(item.id)}
                onChange={() => onItemSelected(item.id)}
              ></Checkbox>
            </MTable.Td>
          )}

          {columns.map((c) => {
            const value = c.getValue ? c.getValue(item, c.key) : item[c.key as keyof T];

            return <MTable.Td key={`${c.label}-${c.key}-${value}`}>{String(value)}</MTable.Td>;
          })}

          {/* Adds a padding element if the table supports bulk actions */}
          {ba.length > 0 && <MTable.Td></MTable.Td>}
        </MTable.Tr>
      );
    },
    [selectedItems, showSelection, columns, ba]
  );

  return (
    <MTable className={classes?.table}>
      <MTable.Thead className={classes?.header}>
        <MTable.Tr>
          <MTable.Th className={classes?.selectAllCheckbox}>
            {showSelectAll && (
              <Checkbox
                checked={!!items.length && items.length === selectedItems.length}
                onChange={() => onSelectAll && onSelectAll()}
              ></Checkbox>
            )}
          </MTable.Th>
          {columns.map((column: any) => (
            <MTable.Th>{column.label}</MTable.Th>
          ))}
          <MTable.Th>
            {ba.length > 0 && (
              <Menu>
                <Menu.Target>
                  <ActionIcon variant="transparent" disabled={!selectedItems.length}>
                    <IconDots></IconDots>
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  {ba.map((action: any) => (
                    <Menu.Item key={action.label} onClick={() => action.handler()}>
                      {action.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )}
          </MTable.Th>
        </MTable.Tr>
      </MTable.Thead>
      <MTable.Tbody>{items.map((row) => renderRow(row))}</MTable.Tbody>
    </MTable>
  );
};
