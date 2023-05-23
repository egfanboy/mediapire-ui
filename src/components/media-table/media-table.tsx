import React from "react";
import { Checkbox, Table } from "@mantine/core";

import {
  elementMapping,
  headerMapping,
} from "./media-types/media-type-factory";
import { MediaTypeEnum } from "../../types/media-type.enum";

interface TableProps {
  items: MediaItemWithNodeId[];
  mediaType: MediaTypeEnum;
  onItemSelected: (itemId: string) => void;
}

export function MediaTable(props: TableProps) {
  const rows = props.items.map((item) => (
    <tr key={item.id}>
      <td>
        <Checkbox onChange={() => props.onItemSelected(item.id)}></Checkbox>
      </td>
      {elementMapping[props.mediaType](item)}
    </tr>
  ));

  return (
    <Table>
      <thead>
        <tr>
          {/* empty td needed to have proper spacing due to the checkbox field */}
          <td></td>
          {headerMapping[props.mediaType]()}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
}
