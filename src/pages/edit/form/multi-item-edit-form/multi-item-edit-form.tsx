import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { IconAlertCircle, IconPencil } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, Group, Modal } from '@mantine/core';
import { useForm, type UseFormReturnType } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { usePollCompletion } from '@/hooks/use-poll-completion/use-poll-completion';
import { changesetService } from '@/services/changeset/changeset-service';
import { mediaService } from '@/services/media/media-service';
import { EditItemForm } from '../edit-item-form';
import { getFormConfigForItem } from '../get-form-config-for-item';
import { getItemPayload } from '../get-item-payload';
import { BulkEditForm } from './bulk-edit-form';

interface MultiEditItemFormProps {
  items: MediaItemWithNodeId[];
}

type EditForm = UseFormReturnType<{ [key: string]: any }>;
type RegisteredForms = Record<string, EditForm>;

export const MultiItemEditForm = ({ items }: MultiEditItemFormProps) => {
  const [registeredForms, setRegisteredForms] = useState<RegisteredForms>({});
  const [formRevision, setFormRevision] = useState(0);
  const [changesetId, setChangesetId] = useState<null | string>(null);
  const [bulkEditing, setBulkEditing] = useState(false);

  const navigate = useNavigate();
  const itemFormConfigs = useMemo(
    () => items.map((item) => ({ item, formConfig: getFormConfigForItem(item) })),
    [items]
  );
  const hasInvalidItemForms = useMemo(
    () => itemFormConfigs.some(({ formConfig }) => !formConfig),
    [itemFormConfigs]
  );

  const registerForm = useCallback((itemId: string, form: EditForm) => {
    setRegisteredForms((currentForms) => {
      if (currentForms[itemId] === form) {
        return currentForms;
      }

      return { ...currentForms, [itemId]: form };
    });
  }, []);

  const unregisterForm = useCallback((nodeId: string) => {
    console.log('unregistering');
    setRegisteredForms((currentForms) => {
      if (!currentForms[nodeId]) {
        return currentForms;
      }

      const { [nodeId]: _removedForm, ...nextForms } = currentForms;
      return nextForms;
    });
  }, []);

  const handleFormChange = useCallback(() => {
    setFormRevision((currentRevision) => currentRevision + 1);
  }, []);

  const forms = useMemo(
    () =>
      itemFormConfigs
        .map(({ item }) => registeredForms[item.id])
        .filter((form): form is EditForm => !!form),
    [formRevision, itemFormConfigs, registeredForms]
  );

  usePollCompletion({
    refetchInterval: 3000,
    queryCompletion: async () => {
      if (!changesetId) return { complete: false };
      try {
        const changeset = await changesetService.getChangeset(changesetId);

        if (changeset.status === 'complete') return { complete: true, success: true };
        if (changeset.status === 'failed') return { complete: true };

        return { complete: false };
      } catch (e) {
        return { complete: true, success: false };
      }
    },
    onComplete(success) {
      if (success) {
        notifications.show({
          title: 'Updated',
          message: 'Successfully updated items',
          autoClose: 2000,
        });
      } else {
        notifications.show({
          title: 'Failed to edit',
          message: 'An error occured when trying to edit these items.',
          autoClose: 5000,
          color: 'red',
          icon: <IconAlertCircle></IconAlertCircle>,
        });
      }

      setChangesetId(null);
    },
    enabled: !!changesetId,
  });

  const handleFormSubmit = useCallback(async () => {
    const { filesMap, changes } = items.reduce<{
      filesMap: { [key: string]: File };
      changes: { mediaId: string; nodeId: string; change: { [key: string]: any } }[];
    }>(
      (acc, item) => {
        const form = registeredForms[item.id];

        if (!form) return acc;

        if (!form.isTouched()) return acc;

        const values = form.getValues();

        const payload = getItemPayload({ values, nodeId: item.nodeId, mediaId: item.id });

        const { data, files } = payload;

        acc.changes = [...acc.changes, data];
        files.forEach((file) => (acc.filesMap[file.fieldName] = file.file));

        return acc;
      },
      { changes: [], filesMap: {} }
    );

    try {
      const files = Object.entries(filesMap).map(([fieldName, file]) => ({ fieldName, file }));
      const changeset = await mediaService.updateMedia(changes, files);
      setChangesetId(changeset.id);
      forms.forEach((form) => form.resetTouched());
    } catch (e) {
      notifications.show({
        title: 'Failed to edit',
        message: 'An error occured when trying to edit all items.',
        autoClose: 5000,
        color: 'red',
        icon: <IconAlertCircle></IconAlertCircle>,
      });
    }
  }, [forms]);

  const allFormsRegistered = forms.length === itemFormConfigs.length;
  const allFormsValid = allFormsRegistered && forms.every((form) => form.isValid());
  const anyFormTouched = forms.some((form) => form.isTouched());
  const canBulkEdit = useMemo(
    () => items.every((item) => item.extension === items[0].extension),
    []
  );

  const handleOnBulkEdit = (values: { [key: string]: any }) => {
    items.forEach((item) => {
      const form = registeredForms[item.id];

      console.log(form);

      if (!form) return;

      console.log(form, values);

      // Use setFieldValue as opposed to form.setValues as this behaves like user interaction
      Object.entries(values).forEach(([key, val]) => form.setFieldValue(key, val));

      // form.setTouched()
    });
  };

  if (hasInvalidItemForms) {
    return <div>Cannot edit some items as there is no form for their extension</div>;
  }

  return (
    <Flex direction="column">
      <Modal opened={bulkEditing} onClose={() => setBulkEditing(false)} withCloseButton={false}>
        <BulkEditForm
          itemType="mp3"
          onEdit={handleOnBulkEdit}
          exitBulkEdit={() => setBulkEditing(false)}
        />
      </Modal>
      <Flex direction="column" style={{ height: '80vh', overflow: 'scroll' }}>
        {canBulkEdit && (
          <Group ml="auto">
            <Button
              mt="md"
              variant="subtle"
              onClick={() => setBulkEditing(true)}
              leftSection={<IconPencil size={14} />}
            >
              Bulk Edit
            </Button>
          </Group>
        )}
        {itemFormConfigs.map(({ item, formConfig }) => (
          <Fragment key={item.id}>
            <h1>{item.name}</h1>
            <MultiItemEditFormItem
              formConfig={formConfig!}
              item={item}
              onFormChange={handleFormChange}
              registerForm={registerForm}
              unregisterForm={unregisterForm}
            />
          </Fragment>
        ))}
      </Flex>
      <Group>
        <Button mt="md" variant="subtle" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          mt="md"
          disabled={!allFormsValid || !anyFormTouched}
          loading={!!changesetId}
          onClick={() => handleFormSubmit()}
        >
          Save
        </Button>
      </Group>
    </Flex>
  );
};

type MultiItemEditFormItemProps = {
  formConfig: NonNullable<ReturnType<typeof getFormConfigForItem>>;
  item: MediaItemWithNodeId;
  onFormChange: () => void;
  registerForm: (itemId: string, form: EditForm) => void;
  unregisterForm: (itemId: string) => void;
};

const MultiItemEditFormItem = ({
  formConfig,
  item,
  onFormChange,
  registerForm,
  unregisterForm,
}: MultiItemEditFormItemProps) => {
  const form = useForm({ ...formConfig, onValuesChange: () => onFormChange() });

  const dependentsConfig = useMemo(() => getFormDependentsConfig(item), [item]);

  useEffect(() => {
    registerForm(item.id, form);

    return () => unregisterForm(item.id);
  }, [item.id, registerForm, unregisterForm]);

  return <EditItemForm form={form} dependentsConfig={dependentsConfig} />;
};

const getFormDependentsConfig = (item: MediaItemWithNodeId): { [key: string]: string[] } => {
  if (item.extension === 'mp3') {
    return {
      trackOf: ['trackIndex'],
    };
  }

  return {};
};
