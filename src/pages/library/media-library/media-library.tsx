import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ActionIcon, Box, Flex, Group, Skeleton, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  actionType,
  GenericConfirmationModal,
} from '../../../components/generic-confirmation-modal/generic-confirmation-modal';
import playbackManager from '../../../components/media-player/playback-manager/playback-manager';
import { mediaPlayerStore } from '../../../components/media-player/state-machine/media-player-store';
import { MediaTable, TableSelectionAction } from '../../../components/media-table/media-table';
import { TextSearch } from '../../../components/text-search/text-search';
import mediaPlayerEvents, {
  MediaPlayerEventType,
} from '../../../events/media-player/media-player.events';
import { mediaService } from '../../../services/media/media-service';
import { mediaStore } from '../../../stores/media/media-store';
import { useMediaStore } from '../../../stores/media/use-media-store';
import { routeDownloadStatus, routeError } from '../../../utils/constants';
import { debounce } from '../../../utils/debounce';
import { filterItem } from './filter-item';
import styles from './media-library.module.css';

const DEFAULT_SORTING_BY_TYPE: { [key: string]: string } = {
  mp3: 'asc(album)',
};
const PAGE_SIZE = 50;

export function MediaLibrary() {
  const library = useMediaStore((s) => s.media);
  const location = useLocation();
  const [init, setInit] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [filteredItems, setFilteredItems] = useState<MediaItemWithNodeId[]>([]);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  const initialFetch = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    playbackManager.init();

    const fetchMedia = async () => {
      initialFetch.current = true;
      await fetchLibrary();
      setInit(false);
    };

    if (!initialFetch.current) {
      fetchMedia();
    }

    return () => {
      playbackManager.destroy();
      // TODO: rethink how these stores work and reset
      mediaStore.setState((s) => ({ ...s, media: [] }));
      mediaPlayerStore.reset();
    };
  }, []);

  const handleSelectedItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((item) => item !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  useEffect(() => {
    filterLibrary();
  }, [library]);

  useEffect(() => {
    filterLibrary();
  }, [filter]);

  const handleSelectAll = () => {
    if (filteredItems.length === selectedItems.length) {
      setSelectedItems([]);

      return;
    } else {
      if (filter) {
        // All filtered items are currently selected so remove them from the selected array
        if (filteredItems.every((item) => selectedItems.includes(item.id))) {
          setSelectedItems(
            selectedItems.filter((id) => !filteredItems.map(({ id }) => id).includes(id))
          );

          return;
        }
        // Some filtered items are not selected so add them
        else {
          const uniqueItemIds = new Set([...selectedItems, ...filteredItems.map(({ id }) => id)]);

          setSelectedItems([...uniqueItemIds]);
          return;
        }
      }

      setSelectedItems(filteredItems.map((item) => item.id));

      return;
    }
  };

  const fetchLibrary = async () => {
    try {
      const mediaType = location.state?.mediaType;
      const response = await mediaService.getMedia({
        mediaType,
        sortBy: DEFAULT_SORTING_BY_TYPE[mediaType],
      });

      mediaStore.setState((s) => ({ ...s, media: response.results }));
    } catch (err: any) {
      navigate(routeError);
    }
  };

  const filterLibrary = () => {
    if (!filter) {
      setFilteredItems(library);
    } else {
      setFilteredItems(library.filter(filterItem(filter)));
    }
  };

  const handleSearch = debounce(setFilter, 200);

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
        navigate(routeDownloadStatus.replace(':id', res.id), {
          state: { id: res.id },
        });
      })
      .catch(() => {
        notifications.show({
          title: 'Error',
          message: 'Failed to start download.',
          autoClose: 5000,
          color: 'red',
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
          title: 'Error',
          message: 'Failed to start media delete.',
          autoClose: 5000,
          color: 'red',
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

  const paginatedItems = useMemo(() => {
    return filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filteredItems, page]);

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
          label: 'Delete Selection',
          type: actionType.destructive,
          action: () => deleteSelectedItems(),
        }}
      >
        Would you like to delete these {selectedItems.length} item(s)? This may take some time and
        you might need to refresh your library to see these files removed.
      </GenericConfirmationModal>

      <Flex direction="row">
        <TextSearch className={styles.searchBox} onSearch={handleSearch} clearable />
        <Group justify="right" mt="md" style={{ marginLeft: 'auto' }}>
          <Tooltip label="Refresh Library">
            <ActionIcon variant="outline" color="" onClick={() => fetchLibrary()}>
              <IconRefresh></IconRefresh>
            </ActionIcon>
          </Tooltip>
        </Group>
      </Flex>

      <MediaTable
        items={library}
        filteredItems={paginatedItems}
        mediaType={location.state?.mediaType}
        onItemSelected={handleSelectedItem}
        onSelectionAction={handleSelectionAction}
        selectedItems={selectedItems}
        showSelectAll
        onSelectAll={handleSelectAll}
        filter={filter}
        pagination={{
          total: Math.ceil(filteredItems.length / PAGE_SIZE),
          current: page,
          setPage,
        }}
      ></MediaTable>
    </>
  );
}
