import React, { useEffect, useState } from 'react';
import { IconAlertCircle, IconDownload } from '@tabler/icons-react';
import saveAs from 'file-saver';
import { Button, Container, Grid, Group, Mark, Skeleton, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { mediaService } from '../../../services/media/media-service';
import { CompleteDownloadProps } from '../download-status.types';
import styles from './complete-download.module.css';

export function CompleteDownload(props: CompleteDownloadProps) {
  const { downloadInfo } = props;
  const [init, setInit] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  } | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const calculatedTimeLeft = calculateTimeLeft(downloadInfo.expiry);
      setTimeLeft(calculatedTimeLeft);

      setInit(false);

      // Clear interval if the expiry date is reached
      if (calculatedTimeLeft === null) {
        clearInterval(intervalId);
      }
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [downloadInfo.expiry]);

  const calculateTimeLeft = (
    expiryTime: string
  ): { hours: string; minutes: string; seconds: string } | null => {
    const currentTime = new Date();
    const expiryDateTime = new Date(expiryTime);

    // Check if the expiry date is in the future
    if (expiryDateTime > currentTime) {
      const timeDifference = expiryDateTime.getTime() - currentTime.getTime();
      const hours = Math.floor(timeDifference / (1000 * 60 * 60))
        .toString()
        .padStart(2, '0');
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
        .toString()
        .padStart(2, '0');
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000)
        .toString()
        .padStart(2, '0');

      return { hours, minutes, seconds };
    }

    // Return null if the expiry date is not in the future
    return null;
  };

  const download = () => {
    setDownloading(true);
    mediaService
      .getDownloadContent(downloadInfo.id)
      .then((res) => {
        saveAs(res, 'mediapire-download.zip');
        setDownloading(false);
      })
      .catch(() => {
        notifications.show({
          title: 'Error',
          message: 'Failed to download file(s).',
          autoClose: 5000,
          color: 'red',
          icon: <IconAlertCircle></IconAlertCircle>,
        });

        setDownloading(false);
      });
  };

  if (init) {
    return (
      <>
        <Skeleton height={8} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} width="70%" radius="xl" />
      </>
    );
  }

  if (timeLeft) {
    return (
      <Container dir="column">
        <Text ta="center" className={styles.infoText}>
          Your download is complete and is still available for{' '}
          <Mark color="blue">
            {timeLeft?.hours}:{timeLeft?.minutes}:{timeLeft?.seconds}
          </Mark>
        </Text>

        <Button loading={downloading} fullWidth={false} onClick={() => download()}>
          <Group>
            <IconDownload />
            <span>Download</span>
          </Group>
        </Button>
      </Container>
    );
  } else {
    return (
      <Container>
        <Grid>
          <Grid.Col>
            <Text ta="left" className={styles.infoText}>
              Unfortunately your download has expired and is no longer available. You can retrigger
              the download and have the content avaialble again.
            </Text>

            <Button onClick={() => alert('not yet implemented')}>Download Again</Button>
          </Grid.Col>
        </Grid>
      </Container>
    );
  }
}
