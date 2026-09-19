import type { ReactNode } from 'react';
import {
  PRESS_COMPRESS,
  PRESS_NOW,
  PRESS_RELEASE,
} from 'components/primitives/press';
import Text from 'components/primitives/Text';
import { cn } from 'utils/cn';

/*
 * The timeline under the about route. A 1px base rule with an accent-2
 * progress rule running to the last stop, inactive ticks as 1x17 stems with a
 * mono label, and one live tick: a 3x24 accent stem with the label in a
 * filled pill, pulsing. Ticks stagger in 40ms apart.
 *
 * The live tick is the route's one 100% accent element -- the yellow budget
 * says the chrome's indicator and the scene's live point are the others, so
 * nothing else on this component may reach solid accent.
 *
 * `at` is a percentage across the track, not a date: the artboards place the
 * six stops at 0 / 15 / 25 / 36 / 46 / 57, which is not linear in time. The
 * progress rule therefore stops where the last tick is, not at 100%.
 */
export type ScrubberStop = {
  id: string | number;
  label: string;
  /** 0-100, position across the track. */
  at: number;
};

export type ScrubberProps = {
  stops: ScrubberStop[];
  selectedIndex?: number;
  from?: string;
  to?: string;
  onSelect?: (index: number) => void;
  /** The fit / prev / next pills, rendered between the endpoints. */
  controls?: ReactNode;
  className?: string;
};

/** Ticks enter 40ms apart, west to east. */
export const TICK_STAGGER_MS = 40;

/**
 * WCAG 2.5.8's floor for a pointer target, in px.
 *
 * The stem is the whole of an inactive tick below 650px -- 1x11 -- because
 * the label that gives it width is dropped at that width on purpose. So the
 * target is not the stem: it is a transparent box centred on it, drawn as a
 * pseudo-element so the tick's own geometry (1px stems on the artboard's
 * percentages) is untouched. 24 rather than 44 because the closest pair of
 * stops on 1h sit 10% apart -- ~39px at 390px -- and two overlapping targets
 * would trade one failure for another.
 */
export const TICK_TARGET_PX = 24;

/**
 * The transparent hit box, centred on the stem it is a child of. `content`
 * and the size are literal because Tailwind reads source text, not values.
 */
export const TICK_TARGET =
  "relative before:absolute before:top-1/2 before:left-1/2 before:h-6 before:w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']";

/** How far the accent progress rule runs: the last stop's position. */
export const progressWidth = (stops: ScrubberStop[]): number =>
  stops.length === 0 ? 0 : stops[stops.length - 1].at;

export const Scrubber = ({
  stops,
  selectedIndex = 0,
  from = '2015',
  to = '2026',
  onSelect,
  controls,
  className,
}: ScrubberProps) => (
  <div className={cn('flex w-full flex-col gap-3', className)}>
    <div className="flex items-center justify-between gap-4">
      <Text
        className="[letter-spacing:var(--type-label-tracking)] text-fg-5"
        variant="readout"
      >
        {from}
      </Text>
      {controls}
      <Text
        className="[letter-spacing:var(--type-label-tracking)] text-fg-5"
        variant="readout"
      >
        {to}
      </Text>
    </div>
    <div className="relative h-11">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-2 h-px bg-surface-3"
      />
      <div
        aria-hidden="true"
        className="absolute top-2 left-0 h-px bg-accent2-line"
        style={{ width: `${progressWidth(stops)}%` }}
      />
      {stops.map((stop, index) => {
        const live = index === selectedIndex;
        return (
          <button
            aria-current={live}
            // The label below is display:none under 650px, and hidden
            // content is excluded from the accessible name -- so at 390px
            // every inactive tick would announce as an unnamed button. The
            // name is on the control, where the breakpoint cannot reach it.
            aria-label={stop.label}
            /*
              The tick had no press state either. It compresses from the
              top, where the tick bar meets the rail, so the bar shortens
              into the line rather than drifting off it.

              PRESS_COMPRESS writes the `scale` property, which is what
              makes it safe here: this button carries `animate-slide-in`,
              whose keyframes end on `transform: translateY(0)` under
              `forwards`, and a filling animation outranks every normal
              author declaration for as long as the element lives. A press
              written as `transform` would have been dead on arrival on
              every tick that had entered -- which is all of them.
            */
            className={cn(
              'absolute top-0 flex animate-slide-in cursor-pointer flex-col gap-2 select-none motion-reduce:animate-none',
              'origin-top',
              PRESS_RELEASE,
              PRESS_COMPRESS,
              PRESS_NOW,
              live ? '-translate-x-1.5 items-center' : 'items-start',
            )}
            data-live={live}
            key={stop.id}
            onClick={() => onSelect?.(index)}
            style={{
              animationDelay: `${index * TICK_STAGGER_MS}ms`,
              left: `${stop.at}%`,
            }}
            type="button"
          >
            <span
              className={cn(
                'flex flex-col gap-2',
                live
                  ? // An indefinite 1.6s pulse with no pause control is
                    // WCAG 2.2.2; reduced motion is the pause.
                    'animate-live-pulse items-center motion-reduce:animate-none'
                  : 'items-start',
              )}
            >
              <span
                className={cn(
                  'block',
                  TICK_TARGET,
                  live
                    ? 'h-[17px] w-[3px] bg-accent tablet:h-6'
                    : 'h-[11px] w-px bg-accent-35 tablet:h-[17px]',
                )}
              />
              {/* 1h drops the inactive labels: at 390px six of them
                  overprint each other, and the ticks still read. */}
              <Text
                className={cn(
                  'block [letter-spacing:0.12em] whitespace-nowrap',
                  live
                    ? 'rounded-[var(--radius-pill)] bg-accent px-[9px] py-[3px] text-on-accent'
                    : 'text-fg-4 max-tablet:hidden',
                )}
                variant="readout"
              >
                {stop.label}
              </Text>
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default Scrubber;
