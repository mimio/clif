import { cameras } from 'content/cameras';
import { projectsList } from 'content/projects';
import HelloPage from 'pagesComponents/hello';
import { PageMeta } from 'pages/_app';
import { useSceneCamera } from 'scene/useSceneCamera';

/** Counted rather than transcribed, so it cannot drift from content/. */
export const HELLO_DESCRIPTION = `Clifton Campbell's personal site: ${projectsList.length} projects, a work history and a globe you can fly.`;

const Hello = () => {
  useSceneCamera(cameras.hello);

  return (
    <>
      <PageMeta
        description={HELLO_DESCRIPTION}
        path="/"
        title="hello"
      />
      <HelloPage />
    </>
  );
};

export default Hello;
