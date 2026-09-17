import Button from 'components/primitives/Button';
import PageWord from 'components/primitives/PageWord';
import Text from 'components/primitives/Text';
import SceneStage from 'components/composed/SceneStage';
import { ABOUT, PROJECTS } from 'content/routes';

/*
 * 1a / 1f. The globe, a 92px page word (40px on mobile), three lines of body
 * and two keycaps. Nothing else: the scene is the content.
 */
export const HelloPage = () => (
  <SceneStage word={<PageWord>hello.</PageWord>} vignette="left">
    <Text variant="body">
      My name is Clifton Campbell. I design and develop software --
      maps, dashboards, and the software around them.
    </Text>
    <div className="clif-hello-actions">
      <Button glyph="projects" href={`/${PROJECTS}`}>
        projects
      </Button>
      <Button glyph="about" href={`/${ABOUT}`} tone="secondary">
        about
      </Button>
    </div>
  </SceneStage>
);

export default HelloPage;
