export const filterItem =
  (filterTerm: string) =>
  (mediaItem: MediaItemWithNodeId): boolean => {
    const filterTermLower = filterTerm.toLowerCase();
    const itemName = mediaItem.name.toLowerCase();

    if (itemName.includes(filterTermLower)) {
      return true;
    }

    /**
     * Loop over every key in the metadata and try to match it if a string
     */
    if (mediaItem.metadata) {
      for (const val of Object.values(mediaItem.metadata)) {
        if (typeof val === 'string') {
          const lowerVal = val.toLowerCase();

          if (lowerVal.includes(filterTermLower)) {
            return true;
          }
        }
      }
    }

    return false;
  };
