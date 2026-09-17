import type { ReactNode } from 'react';
import Text from 'components/primitives/Text';
import { cn } from 'utils/cn';

/*
 * The timeline under the about route. A 1px base rule with an accent progress
 * rule up to the live stop, inactive ticks as 1x17 stems with a mono label,
 * and one live tick: a 3x24 accent stem with the label in a filled pill,
 * pulsing every 2.4s. Ticks stagger in 40ms apart.
 *
 * `at` is a percentage across the track, not a date: the artboards place the
 * six stops at 0 / 15 / 25 / 36 / 46 / 57, which is not linear in time.
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

export const Scrubber = ({
  stops,
  selectedIndex = 0,
  from = '2015',
  to = '2026',
  onSelect,
  controls,
  className,
}: ScrubberProps) => (
  <div className={cn('clif-scrubber', className)}>
    <div className="clif-scrubber-ends">
      <Text variant="readout">{from}</Text>
      {controls}
      <Text variant="readout">{to}</Text>
    </div>
    <div className="clif-scrubber-track">
      {stops.map((stop, index) => (
        <button
          aria-current={index === selectedIndex}
          data-live={index === selectedIndex}
          key={stop.id}
          onClick={() => onSelect?.(index)}
          style={{ left: `${stop.at}%` }}
          type="button"
        >
          {stop.label}
        </button>
      ))}
    </div>
  </div>
);

export default Scrubber;
