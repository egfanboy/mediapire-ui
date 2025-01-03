import React from "react";
import { MediaTypeEnum } from "../../../types/media-type.enum";

type MediaTypeElementFactoryMapping = {
  [key: string]: (item: MediaItemWithNodeId) => JSX.Element[];
};
type MediaTypeHeaderFactoryMapping = {
  [key: string]: () => JSX.Element;
};

const getMp3Element = (item: MediaItemWithNodeId) => {
  const mp3Item = item as Mp3MediaItem;

  return [
    <td key={`mp3item-name-${mp3Item.id}`}>{mp3Item.name}</td>,
    <td key={`mp3item-album-${mp3Item.id}`}>{mp3Item.metadata.album}</td>,
    <td key={`mp3item-artist-${mp3Item.id}`}>{mp3Item.metadata.artist}</td>,
  ];
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
