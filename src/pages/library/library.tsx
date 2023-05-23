import React, { useEffect, useState } from "react";
import { mediaService } from "../../services/media/media-service";
import { Box, Button, Group, Skeleton } from "@mantine/core";
import { MediaTable } from "../../components/media-table/media-table";
import { MediaTypeEnum } from "../../types/media-type.enum";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";

import { saveAs } from "file-saver";

export function LibraryPage() {
  const [library, setLibrary] = useState<MediaItemWithNodeId[]>([]);
  const [init, setInit] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  const handleSelectedItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((item) => item !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const downloadSelectedItems = () => {
    // for now only support smaller batch downloads since backend implementation is not optimal
    if (selectedItems.length > 10) {
      notifications.show({
        title: "Error",
        message: "Cannot download more than 10 files at once.",
        autoClose: 5000,
        color: "red",
        icon: <IconAlertCircle></IconAlertCircle>,
      });
      return;
    }

    const payload = selectedItems.reduce(
      (acc: DownloadMediaRequest, itemId) => {
        const item = library.find((item) => item.id === itemId);

        if (item) {
          acc = [...acc, { nodeId: item.nodeId, mediaId: item.id }];
        }

        return acc;
      },
      []
    );

    setDownloading(true);

    mediaService
      .downloadMedia(payload)
      .then((res) => {
        saveAs(res, "mediapire-download.zip");
        setDownloading(false);
      })
      .catch(() => {
        notifications.show({
          title: "Error",
          message: "Failed to download file(s).",
          autoClose: 5000,
          color: "red",
          icon: <IconAlertCircle></IconAlertCircle>,
        });
      });
  };

  useEffect(() => {
    mediaService.getMedia().then((media) => {
      setLibrary(media);

      setInit(false);
    });
  }, []);

  if (init) {
    return (
      <Box>
        <Skeleton height={8} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} width="70%" radius="xl" />
      </Box>
    );
  }

  return (
    <div>
      <Group position="right" mt="md">
        <Button
          loading={downloading}
          disabled={!selectedItems.length}
          onClick={() => downloadSelectedItems()}
        >
          Download selection
        </Button>
      </Group>

      <MediaTable
        items={library}
        mediaType={MediaTypeEnum.Mp3}
        onItemSelected={handleSelectedItem}
      ></MediaTable>
    </div>
  );
}
