import React from "react";
import { Flex, Skeleton } from "@mantine/core";

import styles from "./mp3-information.module.css";
import { InfiniteScroll } from "../../../infinite-scroll/infinite-scroll";
interface mp3InformationProps {
  currentTrack: { [key: string]: any };
}

export const Mp3Information = (props: mp3InformationProps) => {
  return (
    <Flex className={styles.container}>
      {props.currentTrack.thumbnail ? (
        <img
          className={[
            styles.albumImage,
            props.currentTrack.thumbnail ? styles.albumImagePopulated : "",
          ].join(" ")}
          src={URL.createObjectURL(
            new Blob([props.currentTrack.thumbnail.data], {
              type: props.currentTrack.thumbnail.format,
            })
          )}
        ></img>
      ) : (
        <Skeleton height={75} width={75} />
      )}

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
