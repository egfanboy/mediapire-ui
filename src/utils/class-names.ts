// key represents the class name and the value is a true/false condition
type classNameMapping = { [key: string]: boolean };

export const className = (baseClass: string, mapping: classNameMapping): string =>
  Object.entries(mapping).reduce((acc, [key, val]) => {
    if (val) {
      acc = `${acc} ${key}`;
    }

    return acc;
  }, baseClass);
