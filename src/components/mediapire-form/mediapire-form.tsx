import React from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import {
  Box,
  Button,
  Center,
  Group,
  Loader,
  LoadingOverlay,
  NumberInput,
  Overlay,
  Switch,
  TextInput,
} from '@mantine/core';
import { isInRange, useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import api from '../../api/api';
import { mediapireService } from '../../services/mediapire/mediapire';

// todo: support ipv6/host names
const ipV4Regex =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

interface mediapireFormProps {
  onComplete: () => void;
}

export function MediapireForm(props: mediapireFormProps) {
  const form = useForm({
    initialValues: {
      host: '',
      port: '',
      https: false,
    },

    validate: {
      host: (value) => (ipV4Regex.test(value) ? null : 'Please enter a valid Ipv4 address'),
      port: isInRange({ min: 1, max: 65536 }, 'Must specify a valid port (1-65536)'),
    },

    validateInputOnChange: true,
  });

  const [visible, disclosure] = useDisclosure(false);

  return (
    <Box maw={300} mx="auto" pos="relative">
      <form
        onSubmit={form.onSubmit((values) => {
          disclosure.open();

          mediapireService.saveManagerConfig({
            scheme: values.https ? 'https' : 'http',
            host: values.host,
            port: +values.port,
          });

          api
            // by default browsers can wait up to 300s before reporting a bad request
            .get('/api/v1/health', { signal: AbortSignal.timeout(3000) })
            .then((r) => r.json())
            .then(() => {
              disclosure.close();
              props.onComplete();
            })
            .catch((err: Error) => {
              disclosure.close();

              notifications.show({
                title: 'Failed to connect to Mediapire Manager',
                message: err.message,
                autoClose: 5000,
                color: 'red',
                icon: <IconAlertCircle></IconAlertCircle>,
              });

              mediapireService.deleteManagerConfig();
            });
        })}
      >
        <TextInput
          label="Mediapire Manager IP"
          required
          placeholder="192.168.2.240"
          {...form.getInputProps('host')}
        />

        <NumberInput
          placeholder="9898"
          label="Port"
          required
          hideControls
          {...form.getInputProps('port')}
        />

        <Switch mt="md" label="Use https" {...form.getInputProps('https')} />

        <Group justify="center" mt="md">
          <Button type="submit" disabled={!form.isValid() || !form.isDirty()}>
            Connect
          </Button>
        </Group>

        {visible && (
          <Overlay blur={2} color="rgba(0, 0, 0, 0.3)" zIndex={1000}>
            <Center h="100%">
              <Loader size="xl" />
            </Center>
          </Overlay>
        )}
      </form>
    </Box>
  );
}
