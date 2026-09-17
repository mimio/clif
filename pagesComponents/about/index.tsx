import PageWord from 'components/primitives/PageWord';
import Pager from 'components/composed/Pager';
import Scrubber, {
  type ScrubberStop,
} from 'components/composed/Scrubber';
import Sheet from 'components/composed/Sheet';
import type { HistoryStop } from 'content/history';
import { timeline } from 'content/history';

/*
 * 1e / 1h. Six stops on the Portland terrain, a sheet for the selected one
 * and the scrubber along the bottom. The scrubber's positions come from the
 * artboards, not from the dates: they are laid out to read, not to scale.
 */
export const SCRUBBER_POSITIONS = [0, 15, 25, 36, 46, 57];

export const toScrubberStops = (
  stops: HistoryStop[],
): ScrubberStop[] =>
  stops.map((stop, index) => ({
    id: stop.id,
    label: stop.company.toUpperCase(),
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
};

export const AboutPage = ({
  stops,
  selectedIndex = 3,
  onSelectStop,
}: AboutPageProps) => {
  const stop = stops[selectedIndex];
  const prev = stops[selectedIndex - 1];
  const next = stops[selectedIndex + 1];

  return (
    <main className="clif-about">
      <PageWord size="lg">about</PageWord>
      <Sheet
        eyebrow={`stop ${String(stop.id).padStart(2, '0')} / ${String(
          stops.length,
        ).padStart(2, '0')}`}
        label={stop.role}
        meta={formatStopMeta(stop)}
        pager={
          <Pager
            grow
            next={
              next === undefined
                ? null
                : { href: '#', label: next.company }
            }
            prev={
              prev === undefined
                ? null
                : { href: '#', label: prev.company }
            }
          />
        }
        title={stop.company}
      >
        {stop.description}
      </Sheet>
      <Scrubber
        from={timeline.from}
        onSelect={onSelectStop}
        selectedIndex={selectedIndex}
        stops={toScrubberStops(stops)}
        to={timeline.to}
      />
    </main>
  );
};

export default AboutPage;
