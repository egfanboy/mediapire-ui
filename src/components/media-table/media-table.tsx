import React, { useState } from "react";
import { ActionIcon, Checkbox, Menu, ScrollArea, Table } from "@mantine/core";

import {
  elementMapping,
  headerMapping,
} from "./media-types/media-type-factory";
import { MediaTypeEnum } from "../../types/media-type.enum";
import { IconDots } from "@tabler/icons-react";

import classes from "./media-table.module.css";

export enum TableSelectionAction {
  Download,
  Delete,
}

interface TableProps {
  items: MediaItemWithNodeId[];
  mediaType: MediaTypeEnum;
  onItemSelected: (itemId: string) => void;
  onSelectionAction: (action: TableSelectionAction) => void;
  hasSelectedItems: boolean;
}

export function MediaTable(props: TableProps) {
  const [scrolled, setScrolled] = useState(false);
  const rows = props.items.map((item) => (
    <tr key={item.id}>
      <td>
        <Checkbox onChange={() => props.onItemSelected(item.id)}></Checkbox>
      </td>
      {elementMapping[props.mediaType](item)}
    </tr>
  ));

  return (
    <ScrollArea
      h={0.8 * window.innerHeight}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <Table>
        <thead
          className={[
            classes.tableHeader,
            ...[scrolled ? classes.scrolled : ""],
          ].join(" ")}
        >
          <tr>
            {/* empty td needed to have proper spacing due to the checkbox field */}
            <td></td>
            {headerMapping[props.mediaType]()}
            <td>
              <Menu>
                <Menu.Target>
                  <ActionIcon
                    variant="transparent"
                    color="blue"
                    disabled={!props.hasSelectedItems}
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
                </Menu.Dropdown>
              </Menu>
            </td>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
