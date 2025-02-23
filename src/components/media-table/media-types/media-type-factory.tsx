import React, { JSX } from 'react';
import { Table } from '@mantine/core';
import { MediaTypeEnum } from '../../../types/media-type.enum';

type MediaTypeElementFactoryMapping = {
  [key: string]: (item: MediaItemWithNodeId) => JSX.Element[];
};
type MediaTypeHeaderFactoryMapping = {
  [key: string]: () => JSX.Element;
};

const getElementDefault = (item: MediaItemWithNodeId) => {
  return [<Table.Td key={`item-name-${item.id}`}>{item.name}</Table.Td>];
};

const getDefaultHeaders = () => (
  <>
    <Table.Th>Title</Table.Th>
  </>
);

const getMp3Element = (item: MediaItemWithNodeId) => {
  const mp3Item = item as Mp3MediaItem;

  return [
    <Table.Td key={`mp3item-name-${mp3Item.id}`}>{mp3Item.name}</Table.Td>,
    <Table.Td key={`mp3item-album-${mp3Item.id}`}>{mp3Item.metadata.album}</Table.Td>,
    <Table.Td key={`mp3item-artist-${mp3Item.id}`}>{mp3Item.metadata.artist}</Table.Td>,
  ];
};

const getMp3Headers = () => (
  <>
    <Table.Th>Title</Table.Th>
    <Table.Th>Album</Table.Th>
    <Table.Th>Artist</Table.Th>
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
