import React from "react";
import { useLocation } from "react-router-dom";
import { Footer as MantineFooter } from "@mantine/core";
import { libraryBasePath } from "../../utils/constants";
import { MediaPlayer } from "../media-player/media-player";

export const Footer = () => {
  const location = useLocation();

  if (
    location.pathname.startsWith(libraryBasePath) &&
    location.state?.mediaType
  ) {
    return (
      <MantineFooter height={100}>
        <MediaPlayer />
      </MantineFooter>
    );
  }

  return <></>;
};
