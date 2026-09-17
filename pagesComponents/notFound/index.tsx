import Button from 'components/primitives/Button';
import Icon from 'components/primitives/Icon';
import PageWord from 'components/primitives/PageWord';
import Text from 'components/primitives/Text';
import SceneStage from 'components/composed/SceneStage';

/*
 * No artboard exists for this route. What is specified is the camera
 * (zoom 0.8, the furthest the globe ever gets), the copy and the UFO.
 */
export const NotFoundPage = () => (
  <SceneStage
    align="center"
    word={<PageWord size="lg">404</PageWord>}
    vignette="center"
  >
    <Icon size={40} src="/icons/ufo.svg" title="UFO" />
    <Text variant="body">It Looks Like You Are Lost</Text>
    <Button glyph="home" href="/">
      take me home
    </Button>
  </SceneStage>
);

export default NotFoundPage;
