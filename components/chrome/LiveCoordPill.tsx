import { useEffect, useState } from 'react';
import CoordPill, {
  formatCoordinates,
} from 'components/chrome/CoordPill';
import { watchCamera } from 'scene/liveCamera';

/*
 * The coordinate pill, wired to the map's own transform.
 *
 * WHY THIS IS A COMPONENT OF ITS OWN, and not four lines in ChromeRoot,
 * where it used to live.
 *
 * ChromeRoot held the live centre in its own state and subscribed to
 * `watchCamera` there. The globe's rotation walks the CENTRE MERIDIAN --
 * `setCenter` every animation frame, which is `jumpTo`, which fires
 * `move` -- so on `/` and on the 404 that state was set once per frame
 * for the life of the tab, and every one of those set the WHOLE CHROME
 * rendering again: the altimeter with its rail and its three notches, the
 * theme eye and its eight-swatch panel, the contact mouth, all of it.
 * Measured on the hermetic runner, which draws the globe at about 15fps:
 * 76 React commits in five seconds, and 5,928 of the altimeter's own DOM
 * nodes reconciled inside them. On a 120Hz display it is eight times
 * that, permanently, on the site's front page.
 *
 * None of those components display anything that a camera move changes.
 * One thing does -- the coordinate readout -- so the subscription lives
 * with it, in the smallest component that has a reason to hear about it.
 * That is the whole of the isolation: the chrome above this boundary now
 * renders when the ROUTE, the viewport or a hover changes, which is what
 * it is a function of, and nothing else in it re-renders because the
 * globe turned.
 *
 * WHAT IS NOT CHANGED: the pill still TRACKS. Reading the transform
 * rather than deriving the destination is a deliberate decision (see
 * ChromeRoot's note on the caption) -- during an 800ms flight the pill
 * walks with the globe and arrives when it does, instead of leading it.
 * Bounding the re-render rate must not quietly undo that, so this holds
 * the newest value and commits it, rather than dropping values to hit a
 * rate.
 */

export type LiveCoordPillProps = {
  /**
   * What to print when there is no map to read: no token, the fallback
   * plate, the server render, jsdom. ChromeRoot derives it from the
   * route the same way SceneRoot does.
   */
  fallback: [number, number];
  label: string;
  className?: string;
};

/*
 * TWO GATES, AND THEY CATCH DIFFERENT THINGS. Neither one on its own is
 * the fix, and it is worth writing down which is which, because the
 * obvious one is the weaker of the two here.
 *
 * THE FRAME GATE bounds the commit rate to the display's, whatever the
 * event rate is. `move` is not a frame signal: a drag fires one per
 * pointer event, and a high-polling mouse delivers those well above
 * 60Hz, so a listener that commits per event commits faster than the
 * screen can show. Holding the newest value and committing it on the
 * next animation frame makes ONE COMMIT PER FRAME the ceiling for every
 * source of movement -- the spin, a drag, an ease -- rather than for the
 * spin alone, which is the only one that happens to arrive on a frame
 * already.
 *
 * THE PRINT GATE drops a commit whose OUTPUT would be identical.
 * `formatCoordinates` is the pill's own formatter, so this compares what
 * the visitor would read rather than a rounding of it invented here: if
 * the string is the one already on screen, there is nothing to render.
 * That is what makes a user's slow pan, the last frames of an ease and
 * the held detail route cost nothing at all.
 *
 * ON `/` THE PRINT GATE IS A NO-OP, and pretending otherwise would be
 * the easy lie here. The readout carries three decimals and the globe
 * turns 1.5 degrees a second, so the printed longitude changes every
 * 0.67ms -- far faster than any display refreshes. Quantising to the
 * printed precision therefore cannot reduce the rate on the one route
 * the complaint is about; only the frame gate bounds it, and only the
 * isolation above makes what is inside that bound small. The gate is
 * here because it is correct and because it is what every OTHER route
 * needs, not because it helps the spinning one.
 */
export const useLiveCenter = (): [number, number] | null => {
  const [live, setLive] = useState<[number, number] | null>(null);

  /*
   * Subscribing before the map exists is the normal case -- the chrome
   * mounts before ensureMap resolves -- and watchCamera attaches itself
   * when the map arrives, so there is nothing to retry here and no
   * dependency to re-run on. A visitor with no token never hears
   * anything and this stays null for the life of the tab, which is
   * exactly what the caller's fallback is for.
   */
  useEffect(() => {
    let queued: [number, number] = [0, 0];
    let frame = 0;
    let printed = '';
    const commit = (): void => {
      frame = 0;
      const next = queued;
      const label = formatCoordinates(next[0], next[1]);
      if (label === printed) return;
      printed = label;
      setLive(next);
    };
    const stop = watchCamera((center) => {
      queued = center;
      if (frame === 0) frame = requestAnimationFrame(commit);
    });
    return () => {
      stop();
      // 0 is never a live handle, and cancelling it is specified as a
      // no-op, so this needs no guard of its own.
      cancelAnimationFrame(frame);
    };
  }, []);

  return live;
};

export const LiveCoordPill = ({
  fallback,
  label,
  className,
}: LiveCoordPillProps) => {
  const live = useLiveCenter();
  const center = live ?? fallback;
  return (
    <CoordPill
      className={className}
      label={label}
      lat={center[1]}
      lng={center[0]}
    />
  );
};

export default LiveCoordPill;
