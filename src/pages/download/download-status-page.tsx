import React, { useEffect, useState } from 'react';
import { IconExclamationCircle } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Grid, Loader, Skeleton, Text } from '@mantine/core';
import { mediaService } from '../../services/media/media-service';
import { routeError } from '../../utils/constants';
import { CompleteDownload } from './complete-download/complete-download';
import { DownloadInfo } from './download-status.types';
import styles from './download-status-page.module.css';

const transientStatuses = ['in_progress', 'pending', 'processing_complete'];

const pollingInterval = 5000;

export function DownloadStatusPage() {
  const navigate = useNavigate();

  const [download, setDownload] = useState<DownloadInfo | null>(null);
  const [poller, setPoller] = useState<NodeJS.Timeout | null>(null);

  const params = useParams();

  const fetchDownload = async (downloadId: string) => {
    try {
      const download = await mediaService.getDownload(downloadId);
      setDownload(download);
    } catch (e) {
      return navigate(routeError);
    }
  };

  useEffect(() => {
    if (params.id === undefined) {
      navigate('/');
      return;
    }

    fetchDownload(params.id);
  }, [params.id]);

  useEffect(() => {
    // we are not polling yet but the download is not completed, instantiate polling
    if (download && !poller && transientStatuses.includes(download.status)) {
      setPoller(setTimeout(() => fetchDownload(download.id), pollingInterval));
    }

    // we are currently polling but the download is finished (success/failure does not matter). Remove polling
    if (download && poller && !transientStatuses.includes(download.status)) {
      clearTimeout(poller);
      setPoller(null);
    }

    // unmounting, stop the poller
    return () => {
      if (poller) {
        clearTimeout(poller);
      }
    };
  }, [download]);

  if (download === null) {
    return (
      <>
        <Skeleton height={8} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} width="70%" radius="xl" />
      </>
    );
  } else {
    return (
      <Container className={styles.detailsContainer}>
        <Grid justify="center">
          <Grid.Col span={6}>
            <div className={styles.productInfo}>
              {download.status === 'failed' && (
                <Container dir="column">
                  <IconExclamationCircle className={styles.failedIcon} />
                  <Text ta="left">
                    Unfortunately your download was not able to complete successfully due to:{' '}
                    {download.failureReason}
                  </Text>

                  <Button onClick={() => window.history.back()}>Back To Media</Button>
                </Container>
              )}

              {download.status !== 'complete' && download.status !== 'failed' && (
                <div className={styles.loaderContainer}>
                  <Loader size={40} />
                  <Text size="xl" className={styles.loaderText}>
                    Your download is currently in progress. Once it is complete you will be able to
                    download all the media you have requested.
                  </Text>
                </div>
              )}

              {download.status === 'complete' && <CompleteDownload downloadInfo={download} />}
            </div>
          </Grid.Col>
        </Grid>
      </Container>
    );
  }
}
