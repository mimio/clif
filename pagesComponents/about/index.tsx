import Link from 'next/link';
import PageWord from 'components/primitives/PageWord';
import Text from 'components/primitives/Text';
import SceneStage from 'components/composed/SceneStage';
import type { HistoryStop } from 'content/history';
import {
  FG_REDUCED_MS,
  foregroundEnter,
  type ForegroundEnterOptions,
} from 'scene/enter';
import { cn } from 'utils/cn';

/*
 * 1e, simplified. The word, four lines of copy under it, and the map.
 *
 * WHAT THIS ROUTE USED TO BE, because the difference is the whole change:
 * three pinned regions over a held camera -- the word top-left, a 380px
 * sheet pointing at the map from the right, and a scrubber along the
 * bottom whose ticks were how a stop got selected. The sheet and the
 * scrubber are gone. The copy is loose on the page now, and the MAP is
 * the control: clicking a stop drives the copy above it, which is what
 * `onSelectStop` carries in from scene/layers/sets.ts.
 *
 * That is why the stage is `passThrough`. The foreground used to want
 * every press it could catch; now the only thing worth pressing is behind
 * it, so the stage stops intercepting and the copy block re-enables
 * pointer events for itself alone. SceneStage's own `passThrough` note
 * has the mechanism, and the short version of it is that the map was
 * never un-interactive -- it was covered.
 *
 * TWO ABSOLUTE BOXES, matching the two the artboard draws: the word at
 * top 64 and the copy at top 160, both on the stage's left inset. The
 * copy does not follow the word in flow, because the gap between them is
 * a number 1e states rather than one that falls out of the word's cap
 * height -- and the word's box is `w-fit` (PageWord clips its gradient to
 * itself), so there is nothing for the copy to be laid out against.
 *
 * `mobile` is no longer a prop. It was here for 1h, which drew a bottom
 * sheet with the scrubber folded into it; with both gone the two sizes
 * differ only in the type scale and the two insets, which are tokens and
 * breakpoints rather than a branch. `reduced` stays, because motion is
 * not something CSS can answer for the entrance stagger.
 */

/** 1e and 1h both open on Ubiquiti -- stop 04, the fourth of six. */
export const DEFAULT_STOP_INDEX = 3;

/*
 * Swapping stops is not an arrival, so it must not inherit the entrance
 * handoff: both boards crossfade the copy in 160ms and leave everything
 * else where it is. The crossfade is keyed on the stop -- a new key is a
 * new element, and only a new element runs an entry animation -- while
 * the box around it mounts once with the route and holds its finished
 * state. Neither has to know whether the other has happened.
 *
 * `--slide-in-from` is what the shared enter keyframe travels by, so
 * setting it to 0 turns that same keyframe into a crossfade -- opacity
 * alone -- which is what reduced motion asks for, at the same 200ms the
 * scene uses when there is no flight left to wait for.
 *
 * Literal class strings because Tailwind cannot scan a computed one. The
 * `!` is not decoration: tailwind-merge knows Tailwind's own animation
 * names and no others, so which animation won would otherwise come down
 * to the order the stylesheet happened to emit them in.
 */
export const STOP_CROSSFADE_MS = 160;
export const REDUCED_CROSSFADE_MS = FG_REDUCED_MS;

const CROSSFADE = {
  stop: 'animate-[clif-slidein_160ms_linear_forwards]! [--slide-in-from:0px]',
  reduced:
    'animate-[clif-slidein_200ms_linear_forwards]! [--slide-in-from:0px]',
};

/** `ubiquiti`, `new-york-state-parks`: the stop's name in a URL. */
export const stopSlug = (stop: HistoryStop): string =>
  stop.company.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * Selection is a URL, so a stop can be linked to and the browser's own
 * back button walks the timeline.
 *
 * It stayed a URL through the simplification, and it earns more here than
 * it did before. With the scrubber gone the map is the only control, and
 * a map click is not a thing a crawler, a keyboard or a shared link can
 * perform -- so the six addresses are the route's accessible surface as
 * well as its state. `stopList` below is what puts them in the document.
 */
export const aboutStopPath = (stop: HistoryStop): string =>
  `/about?stop=${stopSlug(stop)}`;

export const ABOUT_PATH = '/about';

/** The label every visitor reads. The id, the path and the scene stay `about`. */
export const ABOUT_WORD = 'about me';

/** The stop a `?stop=` value names, or null when it names none. */
export const stopIndexFor = (
  stops: HistoryStop[],
  slug: unknown,
): number | null => {
  const index = stops.findIndex((stop) => stopSlug(stop) === slug);
  return index === -1 ? null : index;
};

/** 'Portland OR · 2018 — 2020', with an open end for the current stop. */
export const formatStopMeta = (stop: HistoryStop): string => {
  const end = stop.end === null ? 'present' : stop.end.slice(0, 4);
  return `${stop.location} · ${stop.start.slice(0, 4)} — ${end}`;
};

export type AboutPageProps = {
  stops: HistoryStop[];
  selectedIndex?: number;
  reduced?: boolean;
};

export const AboutPage = ({
  stops,
  selectedIndex = DEFAULT_STOP_INDEX,
  reduced = false,
}: AboutPageProps) => {
  const stop = stops[selectedIndex];

  /*
   * 1e's two foreground steps, in its order: the word, then the copy. The
   * wait in front of them is the about move's own, so it cannot drift
   * from the camera.
   */
  const enter: ForegroundEnterOptions = { scene: 'about', reduced };

  /*
   * THE ROUTE'S ONLY KEYBOARD CONTROL, and the reason it exists at all.
   *
   * The scrubber and the pager were how this route was operated without a
   * mouse, and the simplification takes both. What replaces them is a
   * map click -- which is no control at all for a keyboard, and less than
   * that for a screen reader, because scene/SceneRoot's container is
   * `aria-hidden` and always has been. A route whose whole content is
   * six records reachable only by clicking a 3px circle on a canvas is
   * WCAG 2.1.1, and it would have shipped looking exactly right.
   *
   * So the six stops are also six links, off-screen but in the document
   * and in the tab order, pointing at the same `?stop=` addresses the map
   * drives. Nothing about the artboard changes: this paints nothing, and
   * `sr-only` is the utility ContactMouth already uses for its own live
   * region. It is `pointer-events-auto` because the stage around it is
   * not -- focus does not need it, but activating a focused link does.
   *
   * `aria-current="true"` rather than `"page"`: all six are views of one
   * page, which is what the canonical in pages/about.page.tsx says too.
   */
  const stopList = (
    <nav aria-label="Work history" className="sr-only">
      <ul>
        {stops.map((entry, index) => (
          <li key={entry.id}>
            <Link
              aria-current={
                index === selectedIndex ? 'true' : undefined
              }
              className="pointer-events-auto"
              href={aboutStopPath(entry)}
            >
              {entry.company}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <SceneStage
      align="top"
      passThrough
      vignette="night"
      word={
        // 1e puts the word at top 64, 1h at top 52; the stage's column
        // supplies the left inset and this box pins it inside it. The
        // box also carries the step, because PageWord is w-fit so its
        // clipped gradient samples the word itself.
        <div
          className="absolute top-[52px] tablet:top-[64px]"
          style={foregroundEnter(0, enter)}
        >
          <PageWord size="lg">{ABOUT_WORD}</PageWord>
        </div>
      }
    >
      {/*
       * 1e's copy block: left 112 (the stage's inset), top 160, width
       * 520, and 16px between its four lines. The variants are the ones
       * Sheet was already setting this same content in, so the copy did
       * not change size when it came out of the panel -- only the panel
       * went away.
       *
       * `pointer-events-auto` so the prose can still be selected and the
       * links inside a description can still be followed; the stage
       * around it passes presses to the map. The box is `w-fit` for the
       * same reason the word is -- an auto-width box would re-arm the
       * whole left half of the screen as a press target and take the
       * drag back off the map.
       */}
      <div
        className="pointer-events-auto absolute top-[112px] w-fit max-w-[520px] tablet:top-[160px]"
        style={foregroundEnter(1, enter)}
      >
        <div
          className={cn(
            'flex flex-col gap-4',
            reduced ? CROSSFADE.reduced : CROSSFADE.stop,
          )}
          key={stop.id}
        >
          <Text
            className="[letter-spacing:var(--type-label-tracking)] text-fg-4 uppercase"
            variant="label"
          >
            {stop.role}
          </Text>
          <Text
            as="h2"
            className="text-[length:var(--type-heading2-size-mobile)] leading-[1.14] font-[number:var(--weight-light)] text-fg-2 tablet:text-[length:var(--type-heading2-size)]"
            variant="heading3"
          >
            {stop.company}
          </Text>
          <Text
            className="text-[length:var(--type-detail-size)] leading-[var(--type-detail-line)] text-fg-3"
            variant="detail"
          >
            {formatStopMeta(stop)}
          </Text>
          <div className="link-underline text-[length:var(--type-body-size-mobile)] leading-[var(--type-body-line-mobile)] text-fg-3 tablet:text-[length:var(--type-body-size)] tablet:leading-[var(--type-body-line)]">
            <span className="whitespace-pre-line">
              {stop.description}
            </span>
          </div>
        </div>
        {stopList}
      </div>
    </SceneStage>
  );
};

export default AboutPage;
