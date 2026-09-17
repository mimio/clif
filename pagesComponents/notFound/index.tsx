import Button from 'components/primitives/Button';
import Icon from 'components/primitives/Icon';
import PageWord from 'components/primitives/PageWord';
import Text from 'components/primitives/Text';
import SceneStage from 'components/composed/SceneStage';

/*
 * NO ARTBOARD EXISTS FOR THIS ROUTE (design inventory 8, gap 16). What is
 * specified is the camera -- zoom 0.8, the furthest the globe ever gets,
 * deep-space fog, the same four-minute revolution as hello -- the copy, and
 * the UFO that survived the icon cull for exactly this. Everything else is
 * interpolated from the system rather than invented:
 *
 *   the stage    1a's, because 404 IS hello with a further camera: the left
 *                wash, the centred column, the same insets. A centred wash
 *                would have darkened the one thing this route is about.
 *   the word     `404` at the lg step -- 1d's 76px, one below hello's 92 --
 *                so the small globe stays the largest thing in the frame.
 *   the type     body copy at 18/28, as on 1a; no invented eyebrow, no
 *                invented second line.
 *   the yellow   none. The budget (one live map element plus the altimeter
 *                indicator) is already spent on the globe's Portland point,
 *                so the UFO takes the body ink and the cap is the primary
 *                keycap every other route's CTA already is.
 *
 * The register is the readme's, verbatim and not paraphrased: the loader
 * says "Loading stuff..." and this says "It Looks Like You Are Lost". Dry,
 * title-cased, no apology and no joke about maps.
 *
 * The chrome is mounted globally, so nothing here draws the altimeter; the
 * way back is one keycap, as the detail route's "ascend to map" is.
 */
export const NotFoundPage = () => (
  <SceneStage
    align="center"
    vignette="left"
    word={<PageWord size="lg">404</PageWord>}
  >
    <Icon
      className="text-fg-3"
      size={40}
      src="/icons/ufo.svg"
      title="UFO"
    />
    <Text variant="body">It Looks Like You Are Lost</Text>
    <div className="flex">
      <Button glyph="home" href="/">
        take me home
      </Button>
    </div>
  </SceneStage>
);

export default NotFoundPage;
