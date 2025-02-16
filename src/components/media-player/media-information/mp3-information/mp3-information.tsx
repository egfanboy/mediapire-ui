import React from "react";
import { Flex, Image, ThemeIcon } from "@mantine/core";

import styles from "./mp3-information.module.css";
import { InfiniteScroll } from "../../../infinite-scroll/infinite-scroll";
import { mediaService } from "../../../../services/media/media-service";
import { IconMusic } from "@tabler/icons-react";
interface mp3InformationProps {
  currentTrack: { [key: string]: any };
}

const IMAGE_DIMENSION = 75;

export const Mp3Information = (props: mp3InformationProps) => {
  return (
    <Flex className={styles.container}>
      <Image
        className={styles.albumImagePopulated}
        width={IMAGE_DIMENSION}
        height={IMAGE_DIMENSION}
        src={mediaService.getMediaArtStatic(
          props.currentTrack.id,
          props.currentTrack.nodeId
        )}
        withPlaceholder
        placeholder={
          <ThemeIcon variant="light" w={IMAGE_DIMENSION} h={IMAGE_DIMENSION}>
            <IconMusic />
          </ThemeIcon>
        }
      ></Image>

      <Flex direction="column" className={styles.albumPropertiesContainer}>
        <InfiniteScroll onlyScrollOnHover onlyScrollForOverflow>
          <h4 className={[styles.albumTitle, styles.albumProperty].join(" ")}>
            {props.currentTrack.metadata.title}
          </h4>
        </InfiniteScroll>

        <InfiniteScroll onlyScrollOnHover onlyScrollForOverflow>
          <p className={styles.albumProperty}>
            {props.currentTrack.metadata.album}
          </p>
        </InfiniteScroll>
      </Flex>
    </Flex>
  );
};
