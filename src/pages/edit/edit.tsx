import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useNavigateMediaLibrary } from '@/hooks/navigation/use-navigate-media-library';
import { mediaService } from '@/services/media/media-service';
import { MultiItemEditForm } from './form/multi-item-edit-form';
import { SingleItemEditForm } from './form/single-item-edit-form';

export const EditPage = () => {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get('ids');
  const [items, setItems] = useState<MediaItemWithNodeId[] | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navigateToLibrary = useNavigateMediaLibrary();

  const getMediaType = () => {
    // splits the pathname to get the part which represents the mediaType
    const pathParts = location.pathname.split('/').filter((p) => p);

    return pathParts[1];
  };

  useEffect(() => {
    if (ids?.length) {
      // need to manually renavigate to this page to set the mediaType state value on render
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: {
          mediaType: getMediaType(),
        },
      });

      const mediaIds = ids?.split(',');

      mediaService.getMediaByIds(mediaIds).then((items) => setItems(items));
    } else {
      navigateToLibrary(getMediaType());
    }
  }, [ids]);

  if (!items) return <div>Loading...</div>;

  if (items.length === 1)
    return (
      <div>
        <h1>{items[0].name}</h1>
        <SingleItemEditForm item={items[0]} />
      </div>
    );

  return <MultiItemEditForm items={items} />;
};
