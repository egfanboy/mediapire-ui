import React, { useEffect, useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  Collapse,
  Flex,
  Group,
  Loader,
  Table,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { NodeItem } from '../../../components/node-item/node-item';
import { mediaService } from '../../../services/media/media-service';
import { mediapireService } from '../../../services/mediapire/mediapire';
import { transferService } from '../../../services/transfer/transfer';
import styles from './transfer.module.css';

export const TransferPage = () => {
  const [nodes, setNodes] = useState<MediaHostNode[]>([]);
  // TODO: move to API that can filter content based on a node for now we will fetch all media and filter client side
  const [media, setMedia] = useState<MediaItemWithNodeId[]>([]);
  const [target, setTarget] = useState('');
  const [currentNodeSelection, setCurrentNodeSelection] = useState('');
  const [itemsToTransfer, setItemsToTransfer] = useState<{
    [key: string]: string[];
  }>({});

  const [creatingTransfer, setCreatingTransfer] = useState(false);

  const mantineTheme = useMantineTheme();

  useEffect(() => {
    const load = async () => {
      const nodes = await mediapireService.getNodes();

      setNodes(nodes);
    };

    load();
  }, []);

  const handleTargetSelect = (id: string) => {
    if (target == id) {
      setTarget('');
    } else {
      setTarget(id);

      // if new target has items in the transfer list, clear them
      if (itemsToTransfer[id]) {
        const items = { ...itemsToTransfer };
        delete items[id];
        setItemsToTransfer({ ...items });
      }

      // node being selected for content is the new target so clear it
      if (currentNodeSelection === id) {
        setCurrentNodeSelection('');
      }
    }
  };

  const handleNodeForSelection = async (id: string) => {
    if (id === currentNodeSelection) {
      setCurrentNodeSelection('');
    } else {
      // TODO: Refactor this to not fetch all pages on initial load
      let pagination: PaginationInfo = { currentPage: 0, nextPage: 1, previousPage: null };
      let media: MediaItemWithNodeId[] = [];
      while (pagination.nextPage !== null) {
        const response = await mediaService.getMedia({
          page: pagination.nextPage,
          nodeId: id,
          limit: 100,
        });

        media = [...media, ...response.results];

        pagination = response.pagination;
      }
      setMedia(media);
      setCurrentNodeSelection(id);
    }
  };

  const getTooltip = (n: MediaHostNode) => {
    if (!target && n.isUp) {
      return 'Please select a target';
    }
    if (target === n.id) {
      return 'Cannot select media from the target';
    }

    return '';
  };

  const getItemCount = () =>
    Object.keys(itemsToTransfer).reduce((acc, key) => {
      acc += (itemsToTransfer[key] || []).length;
      return acc;
    }, 0);

  const handleItemSelect = (nodeId: string, mediaId: string, select: boolean) => {
    if (select) {
      setItemsToTransfer({
        ...itemsToTransfer,
        [nodeId]: [...(itemsToTransfer[nodeId] || []), mediaId],
      });
    } else {
      setItemsToTransfer({
        ...itemsToTransfer,
        [nodeId]: itemsToTransfer[nodeId]?.filter((id) => id !== mediaId),
      });
    }
  };

  const handleTransfer = async () => {
    const inputs = Object.keys(itemsToTransfer).reduce((acc, key) => {
      const itemsForNode = itemsToTransfer[key].map((mediaId) => ({
        nodeId: key,
        mediaId,
      }));

      acc = [...acc, ...itemsForNode];

      return acc;
    }, [] as MediaItemMapping[]);

    setCreatingTransfer(true);

    try {
      await transferService.startTransfer({ targetId: target, inputs });
      notifications.show({
        title: 'Success',
        message: 'Transfer started successfully.',
        color: 'green',
        autoClose: 2000,
      });
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: 'Failed to start transfer.',
        autoClose: 5000,
        color: 'red',
        icon: <IconAlertCircle></IconAlertCircle>,
      });
    }

    setCreatingTransfer(false);
  };

  if (!nodes.length) {
    return (
      <Group style={{ height: '100dvh' }} align="center" justify="center">
        <Loader />
      </Group>
    );
  }
  return (
    <Flex direction="column" gap="md">
      <Title order={1}>Transfer Media</Title>
      <Text className={styles.descriptionText}>
        Transfer media from nodes to a selected target node.
      </Text>
      <Title order={3}>Select target</Title>
      <Flex gap="md" wrap="wrap">
        {nodes.map((n) => (
          <NodeItem
            key={n.host}
            name={n.name || n.host}
            isUp={n.isUp}
            id={n.id}
            selected={target === n.id}
            onSelect={handleTargetSelect}
          ></NodeItem>
        ))}
      </Flex>
      <Title order={3}>Select media to transfer</Title>
      <Text size="xs" color={mantineTheme.colors.gray[5]}>
        {getItemCount()} item(s) selected
      </Text>
      <Flex gap="md" wrap="wrap">
        {nodes.map((n) => (
          <NodeItem
            key={n.host}
            name={n.name || n.host}
            isUp={n.isUp}
            id={n.id}
            selected={currentNodeSelection === n.id}
            onSelect={handleNodeForSelection}
            disabled={target === n.id || !target}
            tooltip={getTooltip(n)}
          ></NodeItem>
        ))}
      </Flex>
      <Collapse className={styles.selectTableContainer} in={currentNodeSelection !== ''}>
        <Table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Extension</th>
            </tr>
          </thead>
          <tbody>
            {media.map((m) => (
              <tr key={m.nodeId + m.id}>
                <td>
                  <Checkbox
                    checked={!!itemsToTransfer[m.nodeId]?.includes(m.id)}
                    onChange={(v) => handleItemSelect(m.nodeId, m.id, v.target.checked)}
                  />
                </td>
                <td>{m.name}</td>
                <td>{m.extension}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Collapse>

      <Group>
        <Button
          onClick={() => handleTransfer()}
          disabled={getItemCount() === 0 || !target}
          loading={creatingTransfer}
        >
          Transfer
        </Button>
      </Group>
    </Flex>
  );
};
