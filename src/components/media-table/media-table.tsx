import { useEffect, useRef, useState } from 'react';
import { IconEdit } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ActionIcon, Flex, Group, Table as MantineTable, Pagination } from '@mantine/core';
import { LIBRARY_MEDIA_ID_PARAM, routeEdit } from '@/utils/constants';
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
  filteredItems: MediaItemWithNodeId[];
  mediaType: MediaTypeEnum;
  onItemSelected: (itemId: string) => void;
  onSelectionAction: (action: TableSelectionAction) => void;
  selectedItems: string[];
  showSelectAll?: boolean;
  onSelectAll?: () => void;
  pagination: {
    total: number;
    current: number;
    setPage: (page: number) => void;
  };
  pageSize?: number;
  filter: string;
}

const getItemValue = (item: MediaItemWithNodeId, key: string): string => {
  const k = key as keyof MediaItemWithNodeId;
  return item[k] || item.metadata[k];
};

export function MediaTable({ pagination, items, filteredItems, ...props }: TableProps) {
  const [containerHeight, setContainerHeight] = useState(100);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // calculates the max height of the container to be a percentage of the parent element (main)
  useEffect(() => {
    if (containerRef.current) {
      const parentRect = containerRef.current.parentElement?.getBoundingClientRect();

      if (parentRect) {
        setContainerHeight(0.75 * parentRect?.height);
      }
    }
  }, [containerRef.current]);

  return (
    <Flex direction="column" gap="md" ref={containerRef}>
      <MantineTable.ScrollContainer minWidth={500} maxHeight={containerHeight}>
        <Table
          stickyHeader
          classes={{
            table: classes.table,
            selectAllCheckbox: classes.checkboxHeader,
          }}
          columns={[
            { label: 'Title', key: 'title', getValue: getItemValue },
            { label: 'Album', key: 'album', getValue: getItemValue },
            { label: 'Artist', key: 'artist', getValue: getItemValue },
          ]}
          items={items}
          filteredItems={filteredItems.map((f) => ({
            ...f,
            actionCell: (
              <ActionIcon
                variant="outline"
                color=""
                size="sm"
                onClick={() =>
                  navigate(
                    `${routeEdit.replace(LIBRARY_MEDIA_ID_PARAM, props.mediaType)}?ids=${f.id}`
                  )
                }
              >
                <IconEdit></IconEdit>
              </ActionIcon>
            ),
          }))}
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
      </MantineTable.ScrollContainer>
      <Group justify="center">
        <Pagination
          total={pagination.total}
          value={pagination.current}
          onChange={pagination.setPage}
        />
      </Group>
    </Flex>
  );
}
