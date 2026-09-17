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
 * `mobile` and `reduced` arrive as props rather than as hooks: the layer
 * rule keeps scene/ out of pagesComponents, and a component that reads no
 * media query of its own is one both artboards can be rendered from at
 * either size.
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
 * ARRIVING is travel: 1e slides the sheet in over 240ms ease-out-quart from
 * a 40px offset, 1h rises it over 280ms. SWAPPING STOPS IS NOT THAT -- both
 * boards crossfade the copy in 160ms and leave the sheet where it is, "so
 * the route keeps this mounted and changes its children".
 *
 * So the travel belongs to the pinned wrapper, which mounts once with the
 * route, and the crossfade to the Sheet, which is keyed on the stop: a new
 * key is a new element, and only an animation runs on entry. Neither needs
 * to know whether the other has happened. `--slide-in-from` is what the
 * shared enter keyframe translates by, so setting it to 0 turns that same
 * keyframe into a crossfade -- opacity alone, no travel -- which is exactly
 * what reduced motion asks for, at the motion card's 200ms, on both.
 *
 * Every one is a literal class string because Tailwind cannot scan a
 * computed one. The `!` on the crossfade is not decoration: tailwind-merge
 * knows Tailwind's own animation names and no others, so it leaves the
 * sheet's `animate-slide-in-sheet` in place beside this one, and which of
 * the two won would otherwise come down to the order the stylesheet
 * happened to emit them in.
 */
export const STOP_CROSSFADE_MS = 160;
export const REDUCED_CROSSFADE_MS = 200;

const CROSSFADE = {
  stop: 'animate-[clif-slidein_160ms_linear_forwards]! [--slide-in-from:0px]',
  reduced:
    'animate-[clif-slidein_200ms_linear_forwards]! [--slide-in-from:0px]',
};

const ENTER = {
  right:
    'animate-[clif-slidein_240ms_var(--fg-ease)_forwards] [--slide-in-from:40px]',
  bottom:
    'animate-[clif-slidein_280ms_var(--fg-ease)_forwards] [--slide-in-from:40px]',
  reduced:
    'animate-[clif-slidein_200ms_linear_forwards] [--slide-in-from:0px]',
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

  return (
    <>
      <SceneStage
        align="top"
        footer={mobile ? undefined : scrubber}
        vignette="night"
        word={
          // 1e puts the word at top 64, 1h at top 52; the stage's column
          // supplies the left inset and the word pins itself inside it.
          <PageWord
            className="absolute top-[52px] tablet:top-[64px]"
            size="lg"
          >
            about
          </PageWord>
        }
      />
      <div
        className={cn(
          'absolute z-10',
          mobile
            ? 'inset-x-0 bottom-0'
            : 'top-[96px] right-[var(--foreground-right-tablet)] desktop:right-[220px]',
          reduced
            ? ENTER.reduced
            : mobile
              ? ENTER.bottom
              : ENTER.right,
        )}
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
      </div>
    </>
  );
};

export default AboutPage;
