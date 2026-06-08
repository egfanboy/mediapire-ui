import { useMemo, useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { usePollCompletion } from '@/hooks/use-poll-completion/use-poll-completion';
import { changesetService } from '@/services/changeset/changeset-service';
import { mediaService } from '@/services/media/media-service';
import { EditItemForm } from './edit-item-form';
import { getFormConfigForItem } from './get-form-config-for-item';
import { getItemPayload } from './get-item-payload';

export const NUMBER_FIELDS = ['trackOf', 'trackIndex'];
export const FILE_FIELDS = ['art'];

interface EditItemFormProps {
  item: MediaItemWithNodeId;
}

export const SingleItemEditForm = ({ item }: EditItemFormProps) => {
  const formConfig = useMemo(() => getFormConfigForItem(item), [item]);
  const [changesetId, setChangesetId] = useState<null | string>(null);
  const navigate = useNavigate();

  usePollCompletion({
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
          message: 'Successfully updated item',
          autoClose: 2000,
        });
      } else {
        notifications.show({
          title: 'Failed to edit',
          message: 'An error occured when trying to edit this item.',
          autoClose: 5000,
          color: 'red',
          icon: <IconAlertCircle></IconAlertCircle>,
        });
      }

      setChangesetId(null);
    },
    enabled: !!changesetId,
  });

  const handleSubmitForm = async (values: { [key: string]: any }) => {
    const { id: mediaId, nodeId } = item;

    const payload = getItemPayload({ values, nodeId, mediaId });

    const { data: change, files } = payload;

    try {
      const changeset = await mediaService.updateMedia([change], files);
      setChangesetId(changeset.id);

      form.resetTouched();
    } catch (e) {
      notifications.show({
        title: 'Failed to edit',
        message: 'An error occured when trying to edit this item.',
        autoClose: 5000,
        color: 'red',
        icon: <IconAlertCircle></IconAlertCircle>,
      });
    }
  };

  if (!formConfig) return <div>Cannot edit item with extenstion {item.extension}</div>;
  const form = useForm(formConfig);

  const dependencyMappingForMediaType = useMemo(() => getFormDependentsConfig(item), [item]);

  return (
    <Flex direction="column">
      <EditItemForm form={form} dependentsConfig={dependencyMappingForMediaType} />
      <Group>
        <Button mt="md" variant="subtle" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          mt="md"
          disabled={!form.isValid() || !form.isTouched()}
          loading={!!changesetId}
          onClick={() => handleSubmitForm(form.getValues())}
        >
          Save
        </Button>
      </Group>
    </Flex>
  );
};

const getFormDependentsConfig = (item: MediaItemWithNodeId): { [key: string]: string[] } => {
  if (item.extension === 'mp3') {
    return {
      trackOf: ['trackIndex'],
    };
  }

  return {};
};
