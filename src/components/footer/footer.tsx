import React, { useEffect } from 'react';
import { Location, useLocation } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import { libraryBasePath } from '../../utils/constants';
import { MediaPlayer } from '../media-player/media-player';

interface footerProps {
  // setFooterHeight: (h: number) => void;
  setFooterOpened: (v: boolean) => void;
}

const isLibraryPage = (location: Location): boolean => {
  return location.pathname.startsWith(libraryBasePath) && location.state?.mediaType;
};

export const Footer = ({ setFooterOpened }: footerProps) => {
  const location = useLocation();

  useEffect(() => {
    if (isLibraryPage(location)) {
      setFooterOpened(true);
    } else {
      setFooterOpened(false);
    }
  }, [location]);

  if (isLibraryPage(location)) {
    return (
      // need to provide a custom z-index since the nav is 101 and if we show/hide the footer it will show under the nav for a second
      <AppShell.Footer zIndex={102}>
        <MediaPlayer />
      </AppShell.Footer>
    );
  }

  return <></>;
};
