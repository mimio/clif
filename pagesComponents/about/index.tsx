import PageWord from 'components/primitives/PageWord';
import Pill from 'components/primitives/Pill';
import Pager from 'components/composed/Pager';
import SceneStage from 'components/composed/SceneStage';
import Scrubber, {
  type ScrubberStop,
} from 'components/composed/Scrubber';
import Sheet from 'components/composed/Sheet';
import type { HistoryStop } from 'content/history';
import { timeline } from 'content/history';
import {
  FG_REDUCED_MS,
  foregroundEnter,
  type ForegroundEnterOptions,
} from 'scene/enter';
import { cn } from 'utils/cn';

/*
 * 1e / 1h. Six stops on the Portland terrain, a sheet for the selected one
 * and the scrubber along the bottom.
 *
 * THE ROUTE IS THREE PINNED REGIONS, not a column, which is the one way
 * about differs from every other board: the word sits top-left, the sheet
 * points at the map from the right (1e) or rises off the bottom edge (1h),
 * and the scrubber runs along the bottom. So the stage is used for what it
 * owns -- the night wash, the word's inset, the footer rail the scrubber
 * sits on -- and the sheet is pinned beside it rather than poured into the
 * column. Its desktop offset (right 220px, top 96px) is set by the stop it
 * points at, and 1h's is the viewport edge itself; neither is a position
 * Sheet could have chosen for itself, which is why it does not try.
 *
 * `mobile` and `reduced` arrive as props rather than as hooks, so the
 * component reads no media query of its own and both artboards can be
 * rendered from it at either size -- which is what lets one test render 1h
 * beside 1e.
 */

/*
 * The scrubber's positions come from the artboards, not from the dates:
 * they are laid out to read, not to scale.
 */
export const SCRUBBER_POSITIONS = [0, 15, 25, 36, 46, 57];

/** 1e and 1h both open on Ubiquiti -- stop 04, the fourth of six. */
export const DEFAULT_STOP_INDEX = 3;

/*
 * The sheet's two motions, and why they are on two different elements.
 *
 * ARRIVING is the shared foreground handoff: the type waits out 60% of the
 * camera move and then the steps enter 40ms apart, which scene/enter.ts
 * derives from the move this route actually arrives on rather than from a
 * number transcribed off the board. The three steps are 1e's, in its
 * order: the word, the sheet, the scrubber.
 *
 * SWAPPING STOPS IS NOT THAT. Both boards crossfade the copy in 160ms and
 * leave the sheet where it is -- "the route keeps this mounted and changes
 * its children" -- and a swap is not an arrival, so it must not inherit
 * the handoff wait. So the arrival belongs to the pinned wrapper, which
 * mounts once with the route and holds its finished state afterwards, and
 * the crossfade to the Sheet, which is keyed on the stop: a new key is a
 * new element, and only an animation runs on entry. Neither has to know
 * whether the other has happened.
 *
 * `--slide-in-from` is what the shared enter keyframe travels by, so
 * setting it to 0 turns that same keyframe into a crossfade -- opacity
 * alone -- which is what reduced motion asks for, at the same 200ms the
 * scene uses when there is no flight left to wait for.
 *
 * The crossfades are literal class strings because Tailwind cannot scan a
 * computed one, and the `!` is not decoration: tailwind-merge knows
 * Tailwind's own animation names and no others, so it leaves the sheet's
 * `animate-slide-in-sheet` in place beside this one, and which of the two
 * won would otherwise come down to the order the stylesheet happened to
 * emit them in.
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
 * Selection is a URL, so a stop can be linked to and the browser's own back
 * button walks the timeline. Bare /about is the fit view: the sheet still
 * opens on Ubiquiti, as both artboards draw it, but the camera keeps its
 * resting centre rather than a stop's coordinate.
 */
export const aboutStopPath = (stop: HistoryStop): string =>
  `/about?stop=${stopSlug(stop)}`;

export const ABOUT_PATH = '/about';

/** The stop a `?stop=` value names, or null when it names none. */
export const stopIndexFor = (
  stops: HistoryStop[],
  slug: unknown,
): number | null => {
  const index = stops.findIndex((stop) => stopSlug(stop) === slug);
  return index === -1 ? null : index;
};

/**
 * 1e's tick labels are the artboard's SHORT forms of two of the companies,
 * and they have to be: at 11px on a 908px track, `NEW YORK STATE PARKS` and
 * `CITY OF TIGARD` overprint each other and then Nike. The table is keyed by
 * company because content/history.ts has no short-name field yet -- when it
 * grows one this goes away -- and anything not in it keeps its own name.
 */
export const SCRUBBER_SHORT: Record<string, string> = {
  'New York State Parks': 'NY State Parks',
  'City of Tigard': 'Tigard',
};

/**
 * Tick labels. Desktop carries the company (1e); 1h has room for one label
 * and spends it on the live stop's year, so the mobile scrubber reads as a
 * date line rather than a second list of employers.
 */
export type ScrubberLabels = 'company' | 'year';

export const toScrubberStops = (
  stops: HistoryStop[],
  labels: ScrubberLabels = 'company',
): ScrubberStop[] =>
  stops.map((stop, index) => ({
    id: stop.id,
    label:
      labels === 'year'
        ? stop.start.slice(0, 4)
        : (
            SCRUBBER_SHORT[stop.company] ?? stop.company
          ).toUpperCase(),
    at: SCRUBBER_POSITIONS[index],
  }));

/** 'Portland OR · 2018 — 2020', with an open end for the current stop. */
export const formatStopMeta = (stop: HistoryStop): string => {
  const end = stop.end === null ? 'present' : stop.end.slice(0, 4);
  return `${stop.location} · ${stop.start.slice(0, 4)} — ${end}`;
};

export type AboutPageProps = {
  stops: HistoryStop[];
  selectedIndex?: number;
  onSelectStop?: (index: number) => void;
  /** Back to the resting camera, with every stop in frame. */
  onFit?: () => void;
  /** 1h: the sheet takes the bottom edge and the scrubber folds inside it. */
  mobile?: boolean;
  reduced?: boolean;
};

export const AboutPage = ({
  stops,
  selectedIndex = DEFAULT_STOP_INDEX,
  onSelectStop,
  onFit,
  mobile = false,
  reduced = false,
}: AboutPageProps) => {
  const stop = stops[selectedIndex];
  const prev = stops[selectedIndex - 1];
  const next = stops[selectedIndex + 1];

  /*
   * 1e's three foreground steps, in its order: the word, the sheet, the
   * scrubber. The wait in front of them is the about move's own, so it
   * cannot drift from the camera.
   */
  const enter: ForegroundEnterOptions = { scene: 'about', reduced };

  const scrubber = (
    <Scrubber
      // 1e ends the track 420px short of the right edge, so it reads as the
      // sheet's neighbour rather than running under it; the stage's own
      // inset carries 120px of that and this carries the rest. A margin
      // would not do it -- the track is `w-full`, so the box has to shrink.
      className={mobile ? undefined : 'desktop:w-[calc(100%-300px)]'}
      controls={
        mobile ? undefined : (
          <div className="flex gap-2">
            <Pill onClick={onFit} size="sm">
              fit
            </Pill>
            {prev === undefined ? null : (
              <Pill
                onClick={() => onSelectStop?.(selectedIndex - 1)}
                size="sm"
              >
                prev
              </Pill>
            )}
            {next === undefined ? null : (
              <Pill
                onClick={() => onSelectStop?.(selectedIndex + 1)}
                size="sm"
              >
                next
              </Pill>
            )}
          </div>
        )
      }
      from={timeline.from}
      onSelect={onSelectStop}
      selectedIndex={selectedIndex}
      stops={toScrubberStops(stops, mobile ? 'year' : 'company')}
      to={timeline.to}
    />
  );

  /*
   * The stop itself: the role, the dates, the prose and the pager, which
   * is the primary content of this route and not an aside to it.
   *
   * SO IT HAS TO BE INSIDE <main>, and SceneStage IS the <main>. It used
   * to be rendered as a sibling of the stage, which left the landmark
   * holding the page word and the scrubber and nothing else -- "skip to
   * main content" landed on the h1 and stopped. The stage has exactly one
   * slot that renders outside its scrolling column and inside the
   * landmark, which is `footer`, so the pinned regions 1e draws along the
   * bottom and the right go in together.
   *
   * WHY `fixed` AND NOT `absolute`. Both slots the stage offers are
   * positioned boxes with insets of their own -- the column carries the
   * foreground insets and a `forwards` enter animation, which leaves a
   * transform on it for ever and makes it a containing block for anything
   * fixed inside it. `fixed` inside the footer's box resolves against the
   * viewport instead, which is the box this offset was measured from and
   * the box the sibling used to resolve against (#__next is the viewport,
   * 100% x 100%, overflow hidden). Same pixels, one landmark.
   *
   * A <section> rather than a <div>, because this is a section of the
   * page's content and not a box that exists to position one. Measured in
   * Chromium, Sheet's own <aside> still exposes a complementary landmark
   * inside it -- HTML-AAM demotes a nameless <aside> scoped to sectioning
   * content to generic, and this build does not. That role belongs to
   * Sheet's element and Sheet is shared with nothing else on this route,
   * so it is a change for components/, not for here. What matters and is
   * fixed is where the content lives: inside the landmark, in reading
   * order after the word.
   */
  const detail = (
    <section
      className={cn(
        'fixed z-10',
        mobile
          ? 'inset-x-0 bottom-0'
          : 'top-[96px] right-[var(--foreground-right-tablet)] desktop:right-[220px]',
      )}
      style={foregroundEnter(1, enter)}
    >
      <Sheet
        className={reduced ? CROSSFADE.reduced : CROSSFADE.stop}
        eyebrow={`stop ${String(stop.id).padStart(2, '0')} / ${String(
          stops.length,
        ).padStart(2, '0')}`}
        key={stop.id}
        label={stop.role}
        meta={formatStopMeta(stop)}
        pager={
          <Pager
            grow
            next={
              next === undefined
                ? null
                : { href: aboutStopPath(next), label: next.company }
            }
            prev={
              prev === undefined
                ? null
                : { href: aboutStopPath(prev), label: prev.company }
            }
          />
        }
        placement={mobile ? 'bottom' : 'right'}
        title={stop.company}
      >
        <span className="whitespace-pre-line">
          {stop.description}
        </span>
        {mobile ? <div className="pt-2">{scrubber}</div> : null}
      </Sheet>
    </section>
  );

  return (
    <SceneStage
      align="top"
      footer={
        <>
          {detail}
          {mobile ? null : (
            // The scrubber's own ticks stagger 40ms inside this step; the
            // step is when the whole rail is allowed to arrive.
            <div style={foregroundEnter(2, enter)}>{scrubber}</div>
          )}
        </>
      }
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
          <PageWord size="lg">about</PageWord>
        </div>
      }
    />
  );
};

export default AboutPage;
