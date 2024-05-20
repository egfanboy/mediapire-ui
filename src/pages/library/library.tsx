import React, { useEffect, useState } from "react";
import { mediaService } from "../../services/media/media-service";
import {
  Box,
  Button,
  Group,
  Skeleton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { MediaTable } from "../../components/media-table/media-table";
import { MediaTypeEnum } from "../../types/media-type.enum";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

import { useNavigate } from "react-router-dom";
import { routeDownloadStatus, routeError } from "../../utils/constants";

export function LibraryPage() {
  const [library, setLibrary] = useState<MediaItemWithNodeId[]>([]);
  const [init, setInit] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  const handleSelectedItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((item) => item !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const fetchLibrary = async () => {
    try {
      const media = await mediaService.getMedia();
      setLibrary(media);
    } catch (err: any) {
      navigate(routeError);
    }
  };

  const downloadSelectedItems = () => {
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
        navigate(routeDownloadStatus.replace(":id", res.id), {
          state: { id: res.id },
        });
      })
      .catch(() => {
        notifications.show({
          title: "Error",
          message: "Failed to start download.",
          autoClose: 5000,
          color: "red",
          icon: <IconAlertCircle></IconAlertCircle>,
        });
      });
  };

  useEffect(() => {
    const fetchMedia = async () => {
      await fetchLibrary();

      setInit(false);
    };

    fetchMedia();
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
        <Tooltip label="Refresh Library">
          <ActionIcon
            variant="outline"
            color="blue"
            onClick={() => fetchLibrary()}
          >
            <IconRefresh></IconRefresh>
          </ActionIcon>
        </Tooltip>
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
