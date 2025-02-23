import React, { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { CloseButton, TextInput, useMantineTheme } from '@mantine/core';

interface textSearchProps {
  className?: string;
  onSearch?: (s: string) => void;
  clearable?: boolean;
}

export const TextSearch = ({ onSearch, className, clearable = false }: textSearchProps) => {
  const [value, setValue] = useState<string>('');

  const theme = useMantineTheme();

  const handleChange = (value: string) => {
    setValue(value);

    onSearch && onSearch(value);
  };

  return (
    <TextInput
      className={className}
      value={value}
      placeholder="search"
      onChange={(event) => handleChange(event.currentTarget.value)}
      rightSection={clearable && <CloseButton onClick={() => handleChange('')}></CloseButton>}
    />
  );
};
