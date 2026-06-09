import { useMemo } from 'react';
import { Button, Flex, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { EditItemForm } from '../edit-item-form';
import { getBulkEditFormConfig } from '../get-form-config-for-item';

type BulkEditValues = { [key: string]: any };

type BulkEditFormProps = {
  itemType: string;
  onEdit: (values: BulkEditValues) => void;
  exitBulkEdit: () => void;
};

export const BulkEditForm = ({ itemType, onEdit, exitBulkEdit }: BulkEditFormProps) => {
  const formConfig = useMemo(() => getBulkEditFormConfig(itemType), [itemType]);
  if (!formConfig) return <div>Cannot bulk edit items of type {itemType}</div>;
  const form = useForm(formConfig);
  return (
    <Flex direction="column">
      <EditItemForm form={form} />
      <Group>
        <Button mt="md" variant="subtle" onClick={() => exitBulkEdit()}>
          Cancel
        </Button>
        <Button
          mt="md"
          onClick={() => {
            const touched = form.getTouched();

            const values = form.getValues();

            onEdit(
              Object.keys(touched).reduce<{ [key: string]: any }>((acc, key) => {
                acc[key] = values[key];
                return acc;
              }, {})
            );
            exitBulkEdit();
            form.reset();
          }}
        >
          Edit
        </Button>
      </Group>
    </Flex>
  );
};
