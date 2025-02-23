import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Center, Container, Group, Stepper, Text } from '@mantine/core';
import { MediapireForm } from '../../components/mediapire-form/mediapire-form';
import { libraryBasePath } from '../../utils/constants';

export function WelcomePage() {
  const [active, setActive] = useState(0);

  const navigate = useNavigate();

  const nextStep = () => setActive((current) => current + 1);

  const viewLibrary = () => {
    navigate(libraryBasePath);
  };

  return (
    <Container size="xl">
      <Stepper active={active}>
        <Stepper.Step label="Welcome" description="Get Started">
          <Text>
            Welcome to the Mediapire manager. Mediapire manager is an application that let's you
            centrally manage media that is scattered across many devices. It seems like this is your
            first time here. The assumption is that following these steps will link to your
            Mediapire manager instance that is already running.
          </Text>
        </Stepper.Step>
        <Stepper.Step
          label="Mediapire Manager Details"
          description="Provide Mediapire Manager connection information"
        >
          <MediapireForm onComplete={() => nextStep()}></MediapireForm>
        </Stepper.Step>
        <Stepper.Step label="Connected" description="Start using Mediapire">
          <Center>
            <Text>You are now ready to use your Mediapire instance.</Text>
          </Center>
        </Stepper.Step>
      </Stepper>

      <Group justify="center" mt="xl">
        {/* let the form show use its own button */}
        {active === 0 && <Button onClick={nextStep}>Next step</Button>}
        {active === 2 && <Button onClick={viewLibrary}>View Library</Button>}
      </Group>
    </Container>
  );
}
