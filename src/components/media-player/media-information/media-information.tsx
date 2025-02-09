import React from "react";
import { useMediaStore } from "../state-machine/use-media-store";
import { Mp3Information } from "./mp3-information/mp3-information";

const getTrackInformationComponent = (extention: string) => {
  if (extention === "mp3") return Mp3Information;

  return null;
};
export const MediaInformation = () => {
  const currentTrack = useMediaStore((state) => state.currentTrack);
  if (!currentTrack) return null;

  const C = getTrackInformationComponent(currentTrack.extension);

  if (C) {
    return <C currentTrack={currentTrack}></C>;
  }

  return null;
};
