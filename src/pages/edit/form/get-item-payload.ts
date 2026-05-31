import { FILE_FIELDS, NUMBER_FIELDS } from './single-item-edit-form';

type getItemPayloadArgs = {
  values: { [key: string]: any };
  mediaId: string;
  nodeId: string;
};

type itemPayload = {
  data: { mediaId: string; nodeId: string; change: { [key: string]: any } };
  files: { fieldName: string; file: File }[];
};

export const getItemPayload = ({ values, mediaId, nodeId }: getItemPayloadArgs): itemPayload => {
  const files = Object.keys(values).reduce<{ fieldName: string; file: File }[]>(
    (acc, fieldName) => {
      if (FILE_FIELDS.includes(fieldName)) {
        const value = values[fieldName];
        if (value) {
          acc = [...acc, { fieldName, file: value }];
        }
      }

      return acc;
    },
    []
  );

  const change = Object.entries(values).reduce<{ [key: string]: any }>((acc, [key, value]) => {
    if (NUMBER_FIELDS.includes(key)) {
      acc[key] = +value;
    } else if (FILE_FIELDS.includes(key) && value) {
      // Save images as the name of the field as that is what is being sent as part of the FormData
      acc[key] = key;
    } else {
      acc[key] = value;
    }

    return acc;
  }, {});

  return { files, data: { mediaId, nodeId, change } };
};
