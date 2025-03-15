import React, { useEffect, useState } from 'react';
import { Box, Card, Flex, Group, Skeleton, Text } from '@mantine/core';
import { useNavigateMediaLibrary } from '../../hooks/navigation/use-navigate-media-library';
import { mediapireService } from '../../services/mediapire/mediapire';
import styles from './select-media-library.module.css';

export const SelectMediaLibrary = () => {
  const [loading, setLoading] = useState(true);
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const navigateLibraryPage = useNavigateMediaLibrary();

  useEffect(() => {
    const f = async () => {
      const settings = await mediapireService.getSettings();

      // if there is only 1 filetype being tracked go there by default
      if (settings.fileTypes.length === 1) {
        return navigateLibraryPage(settings.fileTypes[0]);
      }

      setMediaTypes(settings.fileTypes);
      setLoading(false);
    };

    f();
  }, []);

  const handleMediaTypeClick = (mediaType: string) => () => navigateLibraryPage(mediaType);

  if (loading) {
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
    <Flex direction="row" gap="lg" wrap="wrap">
      {mediaTypes.map((mt) => (
        <Card
          className={styles.selectMediaLibraryCard}
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          key={mt}
          onClick={handleMediaTypeClick(mt)}
        >
          <Group mb="md">
            <Text fw={500}>Media type:</Text>
          </Group>
          <Text>{mt}</Text>
        </Card>
      ))}
    </Flex>
  );
};
