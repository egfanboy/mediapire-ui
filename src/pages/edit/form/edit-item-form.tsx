import { FileInput, Flex, MantineComponent, NumberInput, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { FILE_FIELDS, NUMBER_FIELDS } from './single-item-edit-form';

interface EditItemFormProps {
  form: UseFormReturnType<{
    [key: string]: any;
  }>;
  dependentsConfig: { [key: string]: string[] };
  onSubmit: ({ values }: { [key: string]: any }) => Promise<any>;
}

export const EditItemForm = ({ form, dependentsConfig, onSubmit }: EditItemFormProps) => {
  return (
    <form>
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

                for (const dep of dependentsConfig[fieldName] || []) {
                  form.validateField(dep);
                }
              }}
            />
          );
        })}
      </Flex>
    </form>
  );
};

const getFormField = (fieldName: string) => {
  let fieldComponent: MantineComponent<any> = TextInput;

  if (NUMBER_FIELDS.includes(fieldName)) {
    fieldComponent = NumberInput;
  }

  if (FILE_FIELDS.includes(fieldName)) {
    fieldComponent = FileInput;
  }

  return fieldComponent;
};
