import React, { useEffect, useState } from "react";
import { mediaService } from "../../services/media/media-service";
import { Box, Group, Skeleton, ActionIcon, Tooltip } from "@mantine/core";
import {
  MediaTable,
  TableSelectionAction,
} from "../../components/media-table/media-table";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

import { useLocation, useNavigate } from "react-router-dom";
import { routeDownloadStatus, routeError } from "../../utils/constants";
import {
  GenericConfirmationModal,
  actionType,
} from "../../components/generic-confirmation-modal/generic-confirmation-modal";

import mediaPlayerEvents, {
  MediaPlayerEventType,
} from "../../events/media-player/media-player.events";
import { useMediaStore } from "../../stores/media/use-media-store";
import { mediaStore } from "../../stores/media/media-store";

export function MediaLibrary() {
  const library = useMediaStore((s) => s.media);
  const location = useLocation();
  const [init, setInit] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  const navigate = useNavigate();

  const handleSelectedItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((item) => item !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSelectAll = () => {
    if (library.length === selectedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(library.map((item) => item.id));
    }
  };

  const fetchLibrary = async () => {
    try {
      const media = await mediaService.getMedia(location.state?.mediaType);
      mediaStore.setState((s) => ({ ...s, media }));
    } catch (err: any) {
      navigate(routeError);
    }
  };

  const getSelectedItemsPayload = () => {
    return selectedItems.reduce((acc: DownloadMediaRequest, itemId) => {
      const item = library.find((item) => item.id === itemId);

      if (item) {
        acc = [...acc, { nodeId: item.nodeId, mediaId: item.id }];
      }

      return acc;
    }, []);
  };

  const downloadSelectedItems = () => {
    const items = getSelectedItemsPayload();

    setDownloading(true);

    mediaService
      .downloadMedia(items)
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

  const deleteSelectedItems = () => {
    const items = getSelectedItemsPayload();

    setShowConfirmDeleteModal(false);
    mediaService
      .deleteMedia(items)
      .then(() => {
        // items should be deleted, remove them from state
        setSelectedItems([]);
        // refresh library since items should be removed
        fetchLibrary();
      })
      .catch(() => {
        notifications.show({
          title: "Error",
          message: "Failed to start media delete.",
          autoClose: 5000,
          color: "red",
          icon: <IconAlertCircle></IconAlertCircle>,
        });
      });
  };

  function handleSelectionAction(action: TableSelectionAction): void {
    switch (action) {
      case TableSelectionAction.Download:
        downloadSelectedItems();
        break;
      case TableSelectionAction.Delete:
        setShowConfirmDeleteModal(true);
        break;
      case TableSelectionAction.Play:
        mediaPlayerEvents.dispatchEvent({
          type: MediaPlayerEventType.SetMediaLibrary,
          data: {
            media: selectedItems
              .map((itemId) => library.find((item) => item.id === itemId))
              // remove potential undefined
              .filter((item) => item),
            autoplay: true,
          },
        });

        // clear selection
        setSelectedItems([]);
        break;
      default:
        break;
    }
  }

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
    <>
      <GenericConfirmationModal
        show={showConfirmDeleteModal}
        onClose={() => setShowConfirmDeleteModal(false)}
        action={{
          label: "Delete Selection",
          type: actionType.destructive,
          action: () => deleteSelectedItems(),
        }}
      >
        Would you like to delete these {selectedItems.length} item(s)? This may
        take some time and you might need to refresh your library to see these
        files removed.
      </GenericConfirmationModal>

      <Group position="right" mt="md">
        <Tooltip label="Refresh Library">
          <ActionIcon variant="outline" color="" onClick={() => fetchLibrary()}>
            <IconRefresh></IconRefresh>
          </ActionIcon>
        </Tooltip>
      </Group>

      <MediaTable
        items={library}
        mediaType={location.state?.mediaType}
        onItemSelected={handleSelectedItem}
        onSelectionAction={handleSelectionAction}
        selectedItems={selectedItems}
        showSelectAll
        onSelectAll={handleSelectAll}
      ></MediaTable>
    </>
  );
}
