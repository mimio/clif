import { cameras } from 'content/cameras';
import NotFoundPage from 'pagesComponents/notFound';
import { useSceneCamera } from 'scene/useSceneCamera';

const NotFound = () => {
  useSceneCamera(cameras.notFound);
  return <NotFoundPage />;
};

export default NotFound;
