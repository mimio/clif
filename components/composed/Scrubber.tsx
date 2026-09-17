import type { ReactNode } from 'react';
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
            className={cn(
              'absolute top-0 flex animate-slide-in cursor-pointer flex-col gap-2 select-none',
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
                  ? 'animate-live-pulse items-center'
                  : 'items-start',
              )}
            >
              <span
                className={cn(
                  'block',
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
