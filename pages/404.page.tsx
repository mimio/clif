import { cameras } from 'content/cameras';
import NotFoundPage from 'pagesComponents/notFound';
import { PageMeta } from 'pages/_app.page';
import { useSceneCamera } from 'scene/useSceneCamera';

const NotFound = () => {
  useSceneCamera(cameras.notFound);

  return (
    <>
      {/* A real title, so the route announcer says something on the way
          in, and noindex, so the thing it says is not indexed. */}
      <PageMeta
        description="That page is not on the map. Take the keycap home."
        noindex
        path="/404"
        title="404"
      />
      <NotFoundPage />
    </>
  );
};

export default NotFound;
