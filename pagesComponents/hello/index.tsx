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
 * with the stage's own gap, and three of this route's numbers are not that
 * column's:
 *   - the step gap is 60px, stepping down to 48px on the tablet stage and
 *     36px on 1f, rather than holding the stage column's 24px;
 *   - the trio is measured to 800px on the desktop stage, which is this
 *     column's own cap and not the stage's inset-to-inset width;
 *   - 1f moves the whole block into the lower half, which inside a centred
 *     column is `margin-top: auto` on the item -- and the item has to be
 *     ours to carry it.
 * So the three steps are one child and the wrapper owns all three numbers.
 * SceneStage still owns the insets, the wash and the scroll pane, which is
 * the part that is actually shared between routes.
 */

/*
 * Two sentences on both stages and a third on the wide one. The desktop
 * stage runs all three in three lines across the column's 800px measure;
 * between 650 and 1000 the paragraph keeps the board's own 520px measure
 * and takes four; 1f, in a column less than half that wide, carries a
 * shorter string rather than nine lines of the same one. One paragraph
 * with its tail hidden keeps that a single copy deck, not two.
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
      {/* The step gap is the ladder in the header -- 60px, 48px under
          1000 and 36px under 650, written the way the page word's own
          sizes are (base, then max-desktop:, then max-tablet:), because
          the bundle's "tablet" step IS <1000px here and its "mobile" step
          IS <650px.

          1f's two offsets past the stage's mobile insets: 120px up from
          the bottom rather than 40 (mb-20), and the column stopping 88px
          from the right rather than 52 (pr-9) -- which is what keeps the
          copy's second line off the chrome stack, since on this route the
          block and the eye/mouth/pill share a band of the screen. */}
      <div className="flex flex-col gap-15 max-desktop:gap-12 max-tablet:mt-auto max-tablet:mb-20 max-tablet:gap-9 max-tablet:pr-9 desktop:max-w-[800px]">
        {/* The word gets its own box: PageWord is w-fit so its clipped
            gradient samples the word itself, and the step's animation
            belongs to the box rather than to the glyphs. */}
        <div style={enter(0)}>
          <PageWord>hello.</PageWord>
        </div>
        {/* One measure at a time, and which element carries it changes at
            1000px. Below that the copy carries the board's 520px itself,
            because the column cannot take that number: the page word is
            76px there and `hello.` sets 500 of the 520, so a column capped
            at the measure would leave the word twenty pixels and no more.
            From 1000px up the column's 800px IS the measure -- the word is
            606 wide at 92px and clears it -- so the paragraph drops its own
            cap rather than the two competing at different numbers. */}
        <Text
          as="p"
          className="m-0 max-w-[520px] text-pretty desktop:max-w-none"
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
