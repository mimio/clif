import Button from 'components/primitives/Button';
import Icon from 'components/primitives/Icon';
import PageWord from 'components/primitives/PageWord';
import Text from 'components/primitives/Text';
import SceneStage from 'components/composed/SceneStage';
import { FG_STAGGER_CARD_MS, foregroundEnter } from 'scene/enter';
import { useReducedMotion } from 'scene/useViewport';

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
export const NotFoundPage = () => {
  const reduced = useReducedMotion();

  /*
   * The entry, which this route had none of. The stage's own column class
   * lands the copy at ~600ms with no delay, while the camera is still
   * flying out to zoom 0.8 -- the one route where the type did not wait
   * for the scene. The camera layer special-cases the 404 in both
   * directions (900ms on the way out, moveDurationFor's `from ===
   * 'notFound'`), so the page ignoring it in neither direction was the
   * oversight, not the design.
   *
   * It is the shared handoff, unmodified: 60% of the move this route
   * actually arrives on -- 480ms of the 800ms flight -- derived by
   * scene/enter.ts rather than transcribed, so retiming the camera retimes
   * this with it. The steps are 1a's three, on 1a's --stagger-card, for
   * the reason the stage is 1a's: the word, the body, the keycap.
   */
  const enter = (step: number) =>
    foregroundEnter(step, {
      reduced,
      scene: 'notFound',
      stagger: FG_STAGGER_CARD_MS,
    });

  return (
    <SceneStage
      align="center"
      vignette="left"
      word={
        // PageWord is w-fit, so the step belongs to a box around it
        // rather than to the clipped gradient's own element.
        <div style={enter(0)}>
          <PageWord size="lg">404</PageWord>
        </div>
      }
    >
      {/* The UFO and the line are one step, as 1a's body is: the mark is
          the illustration for the sentence, not a step before it. The gap
          is the stage column's own, so wrapping them changes nothing but
          what they enter as. */}
      <div className="flex flex-col gap-6" style={enter(1)}>
        <Icon
          className="text-fg-3"
          size={40}
          src="/icons/ufo.svg"
          title="UFO"
        />
        <Text variant="body">It Looks Like You Are Lost</Text>
      </div>
      <div className="flex" style={enter(2)}>
        <Button glyph="home" href="/">
          take me home
        </Button>
      </div>
    </SceneStage>
  );
};

export default NotFoundPage;
