import React from "react";
import { MediaTypeEnum } from "../../../types/media-type.enum";

type MediaTypeElementFactoryMapping = {
  [key: string]: (item: MediaItemWithNodeId) => JSX.Element[];
};
type MediaTypeHeaderFactoryMapping = {
  [key: string]: () => JSX.Element;
};

const getElementDefault = (item: MediaItemWithNodeId) => {
  return [<td key={`item-name-${item.id}`}>{item.name}</td>];
};

const getDefaultHeaders = () => (
  <>
    <th>Title</th>
  </>
);

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

const headerMapping: MediaTypeHeaderFactoryMapping = {
  [MediaTypeEnum.Mp3]: getMp3Headers,
};

const elementMapping: MediaTypeElementFactoryMapping = {
  [MediaTypeEnum.Mp3]: getMp3Element,
};

export const getHeaderFactory = (type: MediaTypeEnum) => {
  const fn = headerMapping[type];

  if (fn) {
    return fn;
  }

  return getDefaultHeaders;
};

export const getElementFactory = (type: MediaTypeEnum) => {
  const fn = elementMapping[type];

  if (fn) {
    return fn;
  }

  return getElementDefault;
};
