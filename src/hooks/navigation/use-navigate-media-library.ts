import { useNavigate } from 'react-router-dom';
import { LIBRARY_MEDIA_ID_PARAM, libraryBasePath, routeMediaLibrary } from '../../utils/constants';

export const useNavigateMediaLibrary = () => {
  const navigate = useNavigate();

  return (mediaType?: string) => {
    if (!mediaType) {
      return navigate(libraryBasePath);
    }
    return navigate(routeMediaLibrary.replace(LIBRARY_MEDIA_ID_PARAM, mediaType), {
      state: { mediaType },
    });
  };
};
