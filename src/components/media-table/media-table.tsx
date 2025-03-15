import React, { useEffect, useRef, useState } from 'react';
import { debounce } from '@/utils/debounce';
import { MediaTypeEnum } from '../../types/media-type.enum';
import { Table } from '../table/table';
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

const getItemValue = (item: MediaItemWithNodeId, key: string): string => {
  const k = key as keyof MediaItemWithNodeId;
  return item[k] || item.metadata[k];
};

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

  const calculateScroll = debounce(async (event: any) => {
    if (scrollRef.current) {
      if (
        scrollRef.current.scrollHeight - containerHeight - event.target.scrollTop < 200 &&
        !fetching
      ) {
        setFetching(true);
        await props.fetchItems();
        setFetching(false);
      }
    }
  }, 200);

  const handleScroll = (event: any) => {
    const scrolledTop = event.target.scrollTop;
    setScrolled(scrolledTop > 0);

    calculateScroll(event);
  };

  return (
    <div
      onScroll={handleScroll}
      ref={scrollRef}
      className={classes.container}
      style={{ height: containerHeight }}
    >
      <Table
        classes={{
          table: classes.table,
          header: [classes.tableHeader, ...[scrolled ? classes.scrolled : '']].join(' '),
          selectAllCheckbox: classes.checkboxHeader,
        }}
        columns={[
          { label: 'Title', key: 'title', getValue: getItemValue },
          { label: 'Album', key: 'album', getValue: getItemValue },
          { label: 'Artist', key: 'artist', getValue: getItemValue },
        ]}
        items={props.items}
        onSelectAll={props.onSelectAll}
        showSelectAll={Boolean(props.showSelectAll)}
        selectedItems={props.selectedItems}
        showSelection={true}
        onItemSelected={props.onItemSelected}
        bulkActions={[
          {
            label: 'Download Selection',
            handler: () => props.onSelectionAction(TableSelectionAction.Download),
          },
          {
            label: 'Delete Selection',
            handler: () => props.onSelectionAction(TableSelectionAction.Delete),
          },
          {
            label: 'Play Selection',
            handler: () => props.onSelectionAction(TableSelectionAction.Play),
          },
        ]}
      ></Table>
    </div>
  );
}
