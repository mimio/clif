import { cameras } from 'content/cameras';
import HelloPage from 'pagesComponents/hello';
import { useSceneCamera } from 'scene/useSceneCamera';

const Hello = () => {
  useSceneCamera(cameras.hello);
  return <HelloPage />;
};

export default Hello;
