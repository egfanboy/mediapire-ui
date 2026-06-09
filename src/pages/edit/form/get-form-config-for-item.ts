import { isInRange, isNotEmpty, type UseFormInput } from '@mantine/form';

type FormConfig = UseFormInput<{ [key: string]: any }>;
type FormConfigOptions = { mode: 'single'; item: MediaItemWithNodeId } | { mode: 'bulk' };

export const getFormConfigForItem = (item: MediaItemWithNodeId): FormConfig | null => {
  let config: FormConfig | null = null;

  if (item.extension === 'mp3') {
    const options: FormConfigOptions = { mode: 'single', item };

    // TODO: add album art and start/end time
    config = {
      mode: 'uncontrolled',
      validateInputOnChange: true,
      initialValues: getMp3FormInitialValues(options),
      enhanceGetInputProps: getMp3EnhancedFormProps(options),
      validate: getMp3FieldValidations(options),
    };
  }

  return config;
};

export const getBulkEditFormConfig = (itemType: string): FormConfig | null => {
  let config: FormConfig | null = null;

  if (itemType === 'mp3') {
    const options: FormConfigOptions = { mode: 'bulk' };

    // TODO: add album art and start/end time
    config = {
      mode: 'uncontrolled',
      validateInputOnChange: true,
      initialValues: getMp3FormInitialValues(options),
      enhanceGetInputProps: getMp3EnhancedFormProps(options),
      validate: getMp3FieldValidations(options),
    };
  }

  return config;
};

const getMp3FormInitialValues = (options: FormConfigOptions) => {
  if (options.mode === 'bulk') {
    return { art: null, name: null, album: null, artist: null };
  }

  const { item } = options;

  return {
    art: null,
    name: getValueFromItem('name', item),
    album: getValueFromItem('album', item),
    artist: getValueFromItem('artist', item),
    trackIndex: getValueFromItem('trackIndex', item) || '',
    trackOf: getValueFromItem('trackOf', item) || '',
  };
};

const getMp3EnhancedFormProps =
  (options: FormConfigOptions): NonNullable<FormConfig['enhanceGetInputProps']> =>
  ({ field: fieldName }) => {
    const isBulkEdit = options.mode === 'bulk';

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
          withAsterisk: !isBulkEdit,
        };
      case 'album':
        return {
          label: 'Album',
          withAsterisk: !isBulkEdit,
        };
      case 'artist':
        return {
          label: 'Artist',
          withAsterisk: !isBulkEdit,
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
  };

const getMp3FieldValidations = (
  options: FormConfigOptions
): NonNullable<FormConfig['validate']> => {
  if (options.mode === 'bulk') {
    return {};
  }

  return {
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
      } else if (value) {
        return `Must provide total tracks before setting track number`;
      }
    },
    trackOf: (value) => {
      if (!value && value !== 0) {
        return null;
      }

      return value <= 0 ? 'Must be greater than 0' : null;
    },
  };
};

function getValueFromItem<T>(fieldName: string, item: MediaItemWithNodeId): T {
  return (item as { [key: string]: any })[fieldName] ?? item.metadata[fieldName] ?? '';
}
