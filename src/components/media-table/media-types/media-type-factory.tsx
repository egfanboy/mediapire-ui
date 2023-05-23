import React from "react";
import { MediaTypeEnum } from "../../../types/media-type.enum";

type MediaTypeElementFactoryMapping = {
  [key: string]: (item: MediaItemWithNodeId) => JSX.Element;
};
type MediaTypeHeaderFactoryMapping = {
  [key: string]: () => JSX.Element;
};

const getMp3Element = (item: MediaItemWithNodeId) => {
  const mp3Item = item as Mp3MediaItem;

  return (
    <>
      <td>{mp3Item.name}</td>
      <td>{mp3Item.metadata.Album}</td>
      <td>{mp3Item.metadata.Artist}</td>
    </>
  );
};

const getMp3Headers = () => (
  <>
    <th>Title</th>
    <th>Album</th>
    <th>Artist</th>
  </>
);

export const headerMapping: MediaTypeHeaderFactoryMapping = {
  [MediaTypeEnum.Mp3]: getMp3Headers,
};

export const elementMapping: MediaTypeElementFactoryMapping = {
  [MediaTypeEnum.Mp3]: getMp3Element,
};
