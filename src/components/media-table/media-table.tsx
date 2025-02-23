import React, { useEffect, useRef, useState } from 'react';
import { IconDots } from '@tabler/icons-react';
import { ActionIcon, Checkbox, Menu, ScrollArea, Table } from '@mantine/core';
import { MediaTypeEnum } from '../../types/media-type.enum';
import { getElementFactory, getHeaderFactory } from './media-types/media-type-factory';
import classes from './media-table.module.css';

export enum TableSelectionAction {
  Download,
  Delete,
  Play,
}

interface TableProps {
  items: MediaItemWithNodeId[];
  mediaType: MediaTypeEnum;
  onItemSelected: (itemId: string) => void;
  onSelectionAction: (action: TableSelectionAction) => void;
  selectedItems: string[];
  showSelectAll?: boolean;
  onSelectAll?: () => void;
}

export function MediaTable(props: TableProps) {
  const [scrolled, setScrolled] = useState(false);
  const [scrollHeight, setScrollHeight] = useState(100);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const parentRect = scrollRef.current.parentElement?.getBoundingClientRect();

      if (parentRect) {
        setScrollHeight(0.75 * parentRect?.height);
      }
    }
  }, [scrollRef.current]);

  const rows = props.items.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Checkbox
          checked={!!props.selectedItems.includes(item.id)}
          onChange={() => props.onItemSelected(item.id)}
        ></Checkbox>
      </Table.Td>
      {getElementFactory(props.mediaType)(item).map((el) => el)}
      <Table.Td></Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea
      ref={scrollRef}
      h={scrollHeight}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
      type="never"
    >
      <Table>
        <Table.Thead
          className={[classes.tableHeader, ...[scrolled ? classes.scrolled : '']].join(' ')}
        >
          <Table.Tr>
            <Table.Th className={classes.checkboxHeader}>
              {props.showSelectAll && (
                <Checkbox
                  checked={
                    !!props.items.length && props.items.length === props.selectedItems.length
                  }
                  onChange={() => props.onSelectAll && props.onSelectAll()}
                ></Checkbox>
              )}
            </Table.Th>
            {getHeaderFactory(props.mediaType)()}
            <Table.Th>
              <Menu>
                <Menu.Target>
                  <ActionIcon variant="transparent" disabled={!props.selectedItems.length}>
                    <IconDots></IconDots>
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item onClick={() => props.onSelectionAction(TableSelectionAction.Download)}>
                    Download Selection
                  </Menu.Item>
                  <Menu.Item onClick={() => props.onSelectionAction(TableSelectionAction.Delete)}>
                    Delete Selection
                  </Menu.Item>
                  <Menu.Item onClick={() => props.onSelectionAction(TableSelectionAction.Play)}>
                    Play Selection
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
