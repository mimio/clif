import Button from 'components/primitives/Button';
import PageWord from 'components/primitives/PageWord';
import Text from 'components/primitives/Text';
import SceneStage from 'components/composed/SceneStage';
import { ABOUT, PROJECTS } from 'content/routes';
import { FG_STAGGER_CARD_MS, foregroundEnter } from 'scene/enter';
import { useReducedMotion } from 'scene/useViewport';

/*
 * 1a and 1f. The globe is the content; this is the three things over it --
 * the page word, three lines of body and two keycaps -- and nothing else.
 * The altimeter, the eye, the mouth and the coordinate pill belong to
 * ChromeRoot and are mounted once in _app, so no route renders them.
 *
 * THE COPY IS LOREM IPSUM ON PURPOSE. The owner's instruction is in
 * chats/chat1.md: "I don't want to put in copy that might actually make it
 * all the way through." Real prose arrives as content, not as a default.
 *
 * WHY ONE WRAPPER ROUND ALL THREE STEPS, rather than handing the word to
 * SceneStage's `word` slot. The stage's column is one centred flex column
 * with the stage's own gap, and two of this route's numbers are not that
 * column's:
 *   - the board's step gap is 32px (20px on 1f), not the column's 24px;
 *   - 1f moves the whole block into the lower half, which inside a centred
 *     column is `margin-top: auto` on the item -- and the item has to be
 *     ours to carry it.
 * So the three steps are one child and the wrapper owns both numbers.
 * SceneStage still owns the insets, the wash and the scroll pane, which is
 * the part that is actually shared between routes.
 */

/*
 * Two sentences on both stages and a third on the wide one. 1a runs three
 * lines inside its 520px measure; 1f, in a column less than half that wide,
 * carries a shorter string rather than nine lines of the same one. One
 * paragraph with its tail hidden keeps that a single copy deck, not two.
 */
export const HELLO_BODY =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore.';

export const HELLO_BODY_WIDE =
  'Magna aliqua ut enim ad minim veniam quis.';

export const HelloPage = () => {
  const reduced = useReducedMotion();

  /*
   * The shared handoff: each step waits out 60% of the move the camera
   * makes arriving here, then runs --fg-enter on --fg-ease. The stagger is
   * passed rather than defaulted -- scene/enter's default is the 40ms row
   * step, and 1a is the board that walks its three foreground steps on
   * --stagger-card's 80ms.
   *
   * `from` is left unset, which is the direct load 1a annotates: the page
   * cannot see the route the camera came from, and only SceneRoot can.
   */
  const enter = (step: number) =>
    foregroundEnter(step, {
      scene: 'hello',
      reduced,
      stagger: FG_STAGGER_CARD_MS,
    });

  return (
    <SceneStage vignette="left">
      {/* 1f's two offsets past the stage's mobile insets: 120px up from
          the bottom rather than 40 (mb-20), and the column stopping 88px
          from the right rather than 52 (pr-9) -- which is what keeps the
          copy's second line off the chrome stack, since on this route the
          block and the eye/mouth/pill share a band of the screen. */}
      <div className="flex flex-col gap-8 max-tablet:mt-auto max-tablet:mb-20 max-tablet:gap-5 max-tablet:pr-9">
        {/* The word gets its own box: PageWord is w-fit so its clipped
            gradient samples the word itself, and the step's animation
            belongs to the box rather than to the glyphs. */}
        <div style={enter(0)}>
          <PageWord>hello.</PageWord>
        </div>
        <Text
          as="p"
          className="m-0 max-w-[520px] text-pretty"
          style={enter(1)}
          variant="body"
        >
          {HELLO_BODY}{' '}
          <span className="max-tablet:hidden">{HELLO_BODY_WIDE}</span>
        </Text>
        {/* 14px between the caps on 1a, 12px on 1f. No bottom margin: the
            keycap already reserves the room its skirt travels into. */}
        <div
          className="flex gap-3.5 max-tablet:gap-3"
          style={enter(2)}
        >
          <Button glyph="projects" href={`/${PROJECTS}`}>
            projects
          </Button>
          <Button glyph="about" href={`/${ABOUT}`} tone="secondary">
            about
          </Button>
        </div>
      </div>
    </SceneStage>
  );
};

export default HelloPage;
