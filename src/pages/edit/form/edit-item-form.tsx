import { useMemo, useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import { Button, Flex, Group, MantineComponent, NumberInput, TextInput } from '@mantine/core';
import { isInRange, isNotEmpty, useForm, UseFormInput } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { usePollCompletion } from '@/hooks/use-poll-completion/use-poll-completion';
import { changesetService } from '@/services/changeset/changeset-service';
import { mediaService } from '@/services/media/media-service';

const NUMBER_FIELDS = ['trackOf', 'trackIndex'];

interface EditItemFormProps {
  item: MediaItemWithNodeId;
}

export const EditItemForm = ({ item }: EditItemFormProps) => {
  const formConfig = useMemo(() => getFormConfig(item), [item]);
  const [changesetId, setChangesetId] = useState<null | string>(null);

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

  if (!formConfig) return <div>Cannot edit item with extenstion {item.extension}</div>;
  const form = useForm(formConfig);

  const dependencyMappingForMediaType = useMemo(() => getFormDependentsConfig(item), [item]);

  const handleSubmitForm = async (values: { [key: string]: any }) => {
    const { id: mediaId, nodeId } = item;

    const change = Object.entries(values).reduce<{ [key: string]: any }>((acc, [key, value]) => {
      if (NUMBER_FIELDS.includes(key)) {
        acc[key] = +value;
      } else {
        acc[key] = value;
      }

      return acc;
    }, {});

    const changes = [
      {
        mediaId,
        nodeId,
        change,
      },
    ];

    try {
      const changeset = await mediaService.updateMedia(changes);
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

  return (
    <form onSubmit={form.onSubmit(handleSubmitForm)}>
      <Flex direction="column">
        {Object.keys(form.getValues()).map((fieldName) => {
          const C = getFormField(fieldName);

          const fieldBaseProps = form.getInputProps(fieldName);
          return (
            <C
              key={form.key(fieldName)}
              label={fieldName}
              {...fieldBaseProps}
              onChange={(e: any) => {
                fieldBaseProps.onChange(e);

                for (const dep of dependencyMappingForMediaType[fieldName] || []) {
                  form.validateField(dep);
                }
              }}
            />
          );
        })}
        <Group>
          <Button
            mt="md"
            disabled={!form.isValid() || !form.isTouched()}
            loading={!!changesetId}
            type="submit"
          >
            Save
          </Button>
        </Group>
      </Flex>
    </form>
  );
};

const getFormField = (fieldName: string) => {
  let fieldComponent: MantineComponent<any> = TextInput;

  if (NUMBER_FIELDS.includes(fieldName)) {
    fieldComponent = NumberInput;
  }

  return fieldComponent;
};

const getFormConfig = (item: MediaItemWithNodeId) => {
  let config: UseFormInput<{ [key: string]: any }> | null = null;

  if (item.extension === 'mp3') {
    // TODO: add album art and start/end time
    config = {
      mode: 'uncontrolled',
      validateInputOnChange: true,
      initialValues: {
        name: getValueFromItem('name', item),
        album: getValueFromItem('album', item),
        artist: getValueFromItem('artist', item),
        trackIndex: getValueFromItem('trackIndex', item) || '',
        trackOf: getValueFromItem('trackOf', item) || '',
      },

      enhanceGetInputProps({ field: fieldName }) {
        switch (fieldName) {
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
