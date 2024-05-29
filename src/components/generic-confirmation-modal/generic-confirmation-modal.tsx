import { Button, Group, Modal } from "@mantine/core";
import React from "react";

export enum actionType {
  destructive = "d",
  neutral = "n",
}

type mainButtonAction = {
  type?: actionType;
  action: () => any;
  label: string;
};

interface GenericConfirmationModalProps extends React.PropsWithChildren {
  show: boolean;
  onClose: () => void;
  action: mainButtonAction;
}

export const GenericConfirmationModal = (
  props: GenericConfirmationModalProps
) => {
  if (props.show) {
    const getButtonColor = () => {
      if (props.action.type) {
        const { type } = props.action;

        if (type === actionType.destructive) {
          return "red";
        }
        if (type === actionType.neutral) {
          return "blue";
        }
      }

      return "blue";
    };

    return (
      <Modal opened onClose={props.onClose} centered withCloseButton={false}>
        {props.children}
        <Group position="right" mt="lg" spacing="lg">
          <Button variant="light" onClick={props.onClose}>
            Cancel
          </Button>
          <Button
            variant="filled"
            color={getButtonColor()}
            onClick={props.action.action}
          >
            {props.action.label}
          </Button>
        </Group>
      </Modal>
    );
  }
  return null;
};
