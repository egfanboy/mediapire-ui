import { isInRange, isNotEmpty, UseFormInput } from '@mantine/form';

export const getFormConfigForItem = (
  item: MediaItemWithNodeId
): UseFormInput<{ [key: string]: any }> | null => {
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
