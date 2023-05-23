import React, { useEffect, useState } from "react";
import { Header, AppShell, Skeleton, Title } from "@mantine/core";

import { Notifications } from "@mantine/notifications";
import { MantineProvider } from "@mantine/core";
import { WelcomePage } from "./pages/welcome/welcome";
import { mediapireService } from "./services/mediapire/mediapire";
import { Route, Routes, useNavigate } from "react-router-dom";
import { routeLibrary, routeSetup } from "./utils/constants";
import { LibraryPage } from "./pages/library/library";

export function App() {
  const [init, setInit] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
    const config = mediapireService.getManagerConfig();

    if (config === null) {
      navigate(routeSetup);
    } else {
      navigate(routeLibrary);
    }
    setInit(false);
  }, [navigate]);

  return (
    <AppShell
      padding="md"
      header={
        <Header height={60} p="xs">
          <Title order={1}>Mediapire</Title>
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
          <Route path={routeLibrary} element={<LibraryPage />} />
        </Routes>
      </MantineProvider>
    </AppShell>
  );
}
