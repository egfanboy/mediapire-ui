import React, { useEffect, useRef, useState } from 'react';
import { IconDots } from '@tabler/icons-react';
import { ActionIcon, Checkbox, Menu, ScrollArea, Table } from '@mantine/core';
import { debounce } from '@/utils/debounce';
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
  fetchItems: () => Promise<any>;
}

export function MediaTable(props: TableProps) {
  const [scrolled, setScrolled] = useState(false);
  const [containerHeight, setcontainerHeight] = useState(100);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [fetching, setFetching] = useState(false);

  // calculates the max height of the container to be a percentage of the parent element
  useEffect(() => {
    if (scrollRef.current) {
      const parentRect = scrollRef.current.parentElement?.getBoundingClientRect();

      if (parentRect) {
        setcontainerHeight(0.75 * parentRect?.height);
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

  const handleScroll = debounce(async (event: any) => {
    const scrolledTop = event.target.scrollTop;
    setScrolled(scrolledTop > 0);

    if (scrollRef.current) {
      if (scrollRef.current.scrollHeight - containerHeight - scrolledTop < 200 && !fetching) {
        setFetching(true);
        await props.fetchItems();
        setFetching(false);
      }
    }
  }, 200);

  return (
    <div
      onScroll={handleScroll}
      ref={scrollRef}
      className={classes.container}
      style={{ maxHeight: containerHeight }}
    >
      <Table className={classes.table}>
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
    </div>
  );
}
