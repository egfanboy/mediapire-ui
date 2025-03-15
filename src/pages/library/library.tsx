import React from 'react';
import { useParams } from 'react-router-dom';
import { MediaLibrary } from './media-library/media-library';
import { SelectMediaLibrary } from './select-media-library';

export const LibraryPage = () => {
  const params = useParams();

  if (params.mediaType) {
    return <MediaLibrary></MediaLibrary>;
  }

  return <SelectMediaLibrary />;
};
