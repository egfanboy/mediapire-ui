import React, { useState } from "react";
import { ActionIcon, TextInput, useMantineTheme } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface textSearchProps {
  className?: string;
  onSearch?: (s: string) => void;
  clearable?: boolean;
}

export const TextSearch = ({
  onSearch,
  className,
  clearable = false,
}: textSearchProps) => {
  const [value, setValue] = useState<string>("");

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
      rightSection={
        clearable && (
          <ActionIcon onClick={() => handleChange("")}>
            <IconX color={theme.colors.gray[4]}></IconX>
          </ActionIcon>
        )
      }
    />
  );
};
