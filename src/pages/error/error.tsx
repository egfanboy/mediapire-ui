import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Group, Text, Title } from '@mantine/core';
import { mediapireService } from '../../services/mediapire/mediapire';
import { libraryBasePath, routeSetup } from '../../utils/constants';
import classes from './error-page.module.css';

export function ErrorPage() {
  const config = mediapireService.getManagerConfig();
  const navigate = useNavigate();

  //   We should only get here if we have a configuration
  if (!config) {
    return null;
  }

  return (
    <Container className={classes.root}>
      <Title className={classes.title}>Cannot connect to your Mediapire instance.</Title>
      <Text c="dimmed" size="lg" ta="left" className={classes.description}>
        There was an issue communicating with your Mediapire instance. The details of your
        configured instance are as follows:
      </Text>
      <Text c="dimmed" size="md" ta="left">
        Host: {config.host}
      </Text>
      <Text c="dimmed" size="md" ta="left">
        Port: {config.port}
      </Text>
      <Text c="dimmed" size="lg" ta="left" className={classes.description}>
        If this information looks correct, you can go back to your library. However, if these
        details are invalid you can go back and change your Mediapire instance details.
      </Text>
      <Group justify="center">
        <Button
          ta="center"
          size="md"
          onClick={() => {
            navigate(libraryBasePath);
          }}
        >
          To Library
        </Button>
        <Button
          ta="center"
          size="md"
          onClick={() => {
            mediapireService.deleteManagerConfig();

            navigate(routeSetup);
          }}
        >
          Reconfigure
        </Button>
      </Group>
    </Container>
  );
}
