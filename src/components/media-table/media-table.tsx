import React, { useEffect, useRef, useState } from "react";
import { ActionIcon, Checkbox, Menu, ScrollArea, Table } from "@mantine/core";

import {
  getElementFactory,
  getHeaderFactory,
} from "./media-types/media-type-factory";
import { MediaTypeEnum } from "../../types/media-type.enum";
import { IconDots } from "@tabler/icons-react";

import classes from "./media-table.module.css";

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
      const parentRect =
        scrollRef.current.parentElement?.getBoundingClientRect();

      if (parentRect) {
        setScrollHeight(0.75 * parentRect?.height);
      }
    }
  }, [scrollRef.current]);

  const rows = props.items.map((item) => (
    <tr key={item.id}>
      <td>
        <Checkbox
          checked={!!props.selectedItems.includes(item.id)}
          onChange={() => props.onItemSelected(item.id)}
        ></Checkbox>
      </td>
      {getElementFactory(props.mediaType)(item).map((el) => el)}
      <td></td>
    </tr>
  ));

  return (
    <ScrollArea
      ref={scrollRef}
      h={scrollHeight}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
      type="never"
    >
      <Table>
        <thead
          className={[
            classes.tableHeader,
            ...[scrolled ? classes.scrolled : ""],
          ].join(" ")}
        >
          <tr>
            <th className={classes.checkboxHeader}>
              {props.showSelectAll && (
                <Checkbox
                  checked={
                    !!props.items.length &&
                    props.items.length === props.selectedItems.length
                  }
                  onChange={() => props.onSelectAll && props.onSelectAll()}
                ></Checkbox>
              )}
            </th>
            {getHeaderFactory(props.mediaType)()}
            <th>
              <Menu>
                <Menu.Target>
                  <ActionIcon
                    variant="transparent"
                    disabled={!props.selectedItems.length}
                  >
                    <IconDots></IconDots>
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    onClick={() =>
                      props.onSelectionAction(TableSelectionAction.Download)
                    }
                  >
                    Download Selection
                  </Menu.Item>
                  <Menu.Item
                    onClick={() =>
                      props.onSelectionAction(TableSelectionAction.Delete)
                    }
                  >
                    Delete Selection
                  </Menu.Item>
                  <Menu.Item
                    onClick={() =>
                      props.onSelectionAction(TableSelectionAction.Play)
                    }
                  >
                    Play Selection
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
