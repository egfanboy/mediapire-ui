import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppShell, Skeleton, Title, useMantineColorScheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Footer } from './components/footer/footer';
import { LeftNav } from './components/left-nav/left-nav';
import { DownloadStatusPage } from './pages/download/download-status-page';
import { ErrorPage } from './pages/error/error';
import { LibraryPage } from './pages/library/library';
import { ManagePage } from './pages/manage/manager';
import { WelcomePage } from './pages/welcome/welcome';
import { mediapireService } from './services/mediapire/mediapire';
import {
  libraryBasePath,
  routeDownloadStatus,
  routeEdit,
  routeError,
  routeManage,
  routeMediaLibrary,
  routeSetup,
} from './utils/constants';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import playbackManager from './components/media-player/playback-manager/playback-manager';
import { EditPage } from './pages/edit/edit';
import { playbackService } from './services/playback/playback';
import {
  setPlaybackSessionError,
  setPlaybackSessionLoading,
  setPlaybackSessionState,
} from './services/playback/playback-session-store';
import { playbackWebsocketService } from './services/playback/playback-websocket';
import styles from './App.module.css';

const NO_NAV_ROUTES = [routeSetup];

export function App() {
  const [init, setInit] = useState(true);
  const [footerOpened, setFooterOpened] = useState(false);

  const { colorScheme } = useMantineColorScheme();

  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeNavigate = () => {
    const config = mediapireService.getManagerConfig();

    if (config === null) {
      navigate(routeSetup);
    } else {
      navigate(libraryBasePath);
    }
  };

  useEffect(() => {
    const syncPlaybackSession = () => {
      setPlaybackSessionLoading();

      return playbackService
        .getSession()
        .then((session) => {
          setPlaybackSessionState(session);
        })
        .catch(() => {
          setPlaybackSessionState(null);
        });
    };

    playbackManager.init();

    const config = mediapireService.getManagerConfig();

    if (config === null) {
      navigate(routeSetup);
      setInit(false);

      return () => {
        playbackManager.destroy();
      };
    }

    // if no route, just reroute to the library
    if (location.pathname === '/') {
      navigate(libraryBasePath);
    }

    void syncPlaybackSession();

    const disconnectPlaybackWebsocket = playbackWebsocketService.connect({
      onSessionUpdated: (session) => {
        if (!session) {
          setPlaybackSessionError();
          return;
        }

        setPlaybackSessionState(session);
      },
      onReconnect: () => {
        void syncPlaybackSession();
      },
    });

    setInit(false);

    return () => {
      disconnectPlaybackWebsocket();
      playbackManager.destroy();
    };
  }, []);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 200,
        breakpoint: 'sm',
        collapsed: { desktop: NO_NAV_ROUTES.includes(location.pathname) },
      }}
      footer={{ height: 100, collapsed: !footerOpened }}
      padding="md"
      styles={(theme) => ({
        main: {
          backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      })}
    >
      <AppShell.Header p="xs">
        <Title
          order={1}
          onClick={() => handleHomeNavigate()}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          Mediapire
        </Title>
      </AppShell.Header>
      <Footer setFooterOpened={setFooterOpened} />
      <LeftNav />
      <AppShell.Main>
        <Notifications />
        {init && (
          <>
            <Skeleton height={8} radius="xl" />
            <Skeleton height={8} mt={6} radius="xl" />
            <Skeleton height={8} mt={6} width="70%" radius="xl" />
          </>
        )}
        <Routes>
          <Route path={routeSetup} element={<WelcomePage />} />
          <Route index path={routeMediaLibrary} element={<LibraryPage />} />
          <Route path={routeError} element={<ErrorPage />} />
          <Route path={routeManage} element={<ManagePage />} />
          <Route path={routeDownloadStatus} element={<DownloadStatusPage />} />
          <Route path={routeEdit} element={<EditPage />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
