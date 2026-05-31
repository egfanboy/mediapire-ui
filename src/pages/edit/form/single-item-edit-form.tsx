import { useMemo, useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, Group } from '@mantine/core';
import { isInRange, isNotEmpty, useForm, UseFormInput } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { usePollCompletion } from '@/hooks/use-poll-completion/use-poll-completion';
import { changesetService } from '@/services/changeset/changeset-service';
import { mediaService } from '@/services/media/media-service';
import { EditItemForm } from './edit-item-form';
import { getItemPayload } from './get-item-payload';

export const NUMBER_FIELDS = ['trackOf', 'trackIndex'];
export const FILE_FIELDS = ['art'];

interface EditItemFormProps {
  item: MediaItemWithNodeId;
}

export const SingleItemEditForm = ({ item }: EditItemFormProps) => {
  const formConfig = useMemo(() => getFormConfig(item), [item]);
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

    const { data: changes, files } = payload;

    try {
      const changeset = await mediaService.updateMedia([changes], files);
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
      <EditItemForm
        form={form}
        dependentsConfig={dependencyMappingForMediaType}
        onSubmit={handleSubmitForm}
      />
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

const getFormConfig = (item: MediaItemWithNodeId) => {
  let config: UseFormInput<{ [key: string]: any }> | null = null;

  if (item.extension === 'mp3') {
    // TODO: add album art and start/end time
    config = {
      mode: 'uncontrolled',
      validateInputOnChange: true,
      initialValues: {
        art: null,
        name: getValueFromItem('name', item),
        album: getValueFromItem('album', item),
        artist: getValueFromItem('artist', item),
        trackIndex: getValueFromItem('trackIndex', item) || '',
        trackOf: getValueFromItem('trackOf', item) || '',
      },

      enhanceGetInputProps({ field: fieldName }) {
        switch (fieldName) {
          case 'art': {
            return {
              label: 'Album Art',
              clearable: true,
              accept: 'image/jpeg,image/jpg',
              placeholder: 'Upload Album Art',
            };
          }
          case 'name':
            return {
              label: 'Song Name',
              withAsterisk: true,
            };
          case 'album':
            return {
              label: 'Album',
              withAsterisk: true,
            };
          case 'artist':
            return {
              label: 'Artist',
              withAsterisk: true,
            };
          case 'trackIndex':
            return {
              label: 'Track Number',
            };
          case 'trackOf':
            return {
              label: 'Total Tracks',
            };
          default:
            return {};
        }
      },

      validate: {
        name: isNotEmpty('Name is required'),
        album: isNotEmpty('Album is required'),
        artist: isNotEmpty('Artist is required'),
        trackIndex: (value, values) => {
          // Can be left blank
          if (!value && value !== 0) {
            return null;
          }

          const hasATrackNumber = !!values.trackOf;

          if (hasATrackNumber) {
            return isInRange(
              { min: 1, max: values.trackOf },
              `Must be between 1 and ${values.trackOf}`
            )(value);
          } else if (!!value) {
            return `Must provide total tracks before setting track number`;
          }
        },
        trackOf: (value) => {
          if (!value && value !== 0) {
            return null;
          }

          return value <= 0 ? 'Must be greater than 0' : null;
        },
      },
    };
  }

  return config;
};

function getValueFromItem<T>(fieldName: string, item: MediaItemWithNodeId): T {
  return (item as { [key: string]: any })[fieldName] ?? item.metadata[fieldName] ?? '';
}

const getFormDependentsConfig = (item: MediaItemWithNodeId): { [key: string]: string[] } => {
  if (item.extension === 'mp3') {
    return {
      trackOf: ['trackIndex'],
    };
  }

  return {};
};
