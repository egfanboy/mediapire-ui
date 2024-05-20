import React, { useEffect, useState } from "react";
import { Header, AppShell, Skeleton, Title } from "@mantine/core";

import { Notifications } from "@mantine/notifications";
import { MantineProvider } from "@mantine/core";
import { WelcomePage } from "./pages/welcome/welcome";
import { mediapireService } from "./services/mediapire/mediapire";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  routeDownloadStatus,
  routeError,
  routeLibrary,
  routeSetup,
} from "./utils/constants";
import { LibraryPage } from "./pages/library/library";
import { ErrorPage } from "./pages/error/error";
import { DownloadStatusPage } from "./pages/download/download-status-page";

export function App() {
  const [init, setInit] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeNavigate = () => {
    const config = mediapireService.getManagerConfig();

    if (config === null) {
      navigate(routeSetup);
    }

    navigate(routeLibrary);
  };

  useEffect(() => {
    const config = mediapireService.getManagerConfig();

    if (config === null) {
      navigate(routeSetup);
    }

    // if no route, just reroute to the library
    if (location.pathname === "/") {
      navigate(routeLibrary);
    }

    setInit(false);
  }, []);

  return (
    <AppShell
      padding="md"
      header={
        <Header height={60} p="xs">
          <Title
            order={1}
            onClick={() => handleHomeNavigate()}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            Mediapire
          </Title>
        </Header>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      <MantineProvider>
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
          <Route index path={routeLibrary} element={<LibraryPage />} />
          <Route path={routeError} element={<ErrorPage />} />
          <Route path={routeDownloadStatus} element={<DownloadStatusPage />} />
        </Routes>
      </MantineProvider>
    </AppShell>
  );
}
