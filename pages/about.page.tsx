import { useEffect, useSyncExternalStore } from 'react';
import type { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { cameras } from 'content/cameras';
import {
  historyStops,
  timeline,
  type HistoryStop,
} from 'content/history';
import AboutPage, {
  ABOUT_PATH,
  ABOUT_WORD,
  aboutStopPath,
  DEFAULT_STOP_INDEX,
  stopIndexFor,
} from 'pagesComponents/about';
import { PageMeta } from 'pages/_app.page';
import { useSceneView, useStopRequest } from 'scene/MapProvider';
import { useSceneCamera } from 'scene/useSceneCamera';
import { useReducedMotion } from 'scene/useViewport';

/*
 * The selected stop is a URL, not component state: /about?stop=ubiquiti.
 * That makes a stop linkable, makes the browser's back button walk the
 * timeline, and -- now that the map is the only control -- gives the six
 * stops an address a keyboard and a crawler can reach.
 *
 * THE CAMERA NO LONGER FOLLOWS THE SELECTION, which is the change this
 * route turns on. It used to refine cameras.about to the selected stop's
 * own coordinate on every selection, so every click was a 600ms reframe.
 * The simplified board rests the camera over the DATA -- cameras.about's
 * `at` puts the projection centre at 0.7 of the height, below the copy --
 * and leaves it there. Two reasons, and the second is the real one:
 *
 *   The click's job is the copy. "Click around on the map and drive the
 *   copy" is one effect, not two, and a camera that chased every click
 *   would be answering a question nobody asked.
 *
 *   The map is DRAGGABLE now (SceneStage's `passThrough`). A route that
 *   re-aimed the camera on selection would undo the visitor's own pan the
 *   moment they clicked anything on it -- the two features would be
 *   fighting over the same transform.
 *
 * So this page declares one constant camera. `useSceneCamera` still wants
 * a stable reference and `cameras.about` is one, which is why there is no
 * useMemo left here.
 *
 * The map's one live element is the same stop the copy is showing -- 1e's
 * yellow budget allows exactly one, and on this route it is the selected
 * point. The scene takes the stop's id, not the slug the URL carries, so
 * it is read off the stop rather than passed through from the query.
 */

/*
 * READING THE DEEP LINK BEFORE THE FIRST PAINT.
 *
 * `router.query` is empty on the static render AND on the first client
 * render: with a query string in the URL the Next router starts
 * `isReady: false` and fills the query a task later. A route that reads
 * only `router.query` therefore opens /about?stop=nike on Ubiquiti and
 * shows ~190ms of the wrong copy, with the globe's one live point lit on
 * the wrong stop.
 *
 * The URL itself is not late; only the router's copy of it is. So the slug
 * is read straight off `location.search` through useSyncExternalStore,
 * whose server snapshot is the empty one the static HTML was built with.
 * That is the hydration-safe way to know something the server could not:
 * React renders the server value, notices the snapshots disagree and
 * re-renders synchronously, before the browser paints and before any
 * passive effect has run, which is where SceneRoot constructs the map. The
 * map goes live already knowing which stop this is.
 *
 * This mattered more when the camera followed the selection -- it is what
 * bought one 800ms flight instead of a flight and a reframe. With a
 * constant camera the saving is the copy and the lit point rather than a
 * camera move, which is smaller but is still the difference between
 * arriving on the stop you asked for and arriving on stop 04.
 *
 * Once the router IS ready it takes over: it is the only one of the two
 * that sees a shallow push, which is how a map click changes stops
 * without a navigation.
 *
 * WHAT THIS DOES NOT FIX, and the trade: the server HTML. /about is
 * getStaticProps, so one file answers all six deep links and a no-JS
 * reader still gets stop 04. getServerSideProps would fix that, at the
 * cost of putting a server round trip in front of a document whose six
 * stops are already in the bundle -- for a route whose content is a map.
 * The honest statement is instead the canonical below: ?stop= is a view of
 * /about, not a second document, so a crawler is told to index /about once
 * rather than six near-identical pages.
 */
const subscribeToNothing = (): (() => void) => () => {};

/** The `?stop=` slug the browser's URL carries, if any. */
const stopFromLocation = (): string | undefined =>
  new URLSearchParams(window.location.search).get('stop') ??
  undefined;

/** The static HTML carries no query, so the server knows no stop. */
const noStopOnTheServer = (): undefined => undefined;

type AboutProps = {
  stops: HistoryStop[];
};

export const ABOUT_DESCRIPTION = `Clifton Campbell's work history, stop by stop on the globe: ${historyStops.length} of them, ${timeline.from} to ${timeline.to}.`;

const About = ({ stops }: AboutProps) => {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { stopRequest, requestStop } = useStopRequest();

  const earlyStop = useSyncExternalStore(
    subscribeToNothing,
    stopFromLocation,
    noStopOnTheServer,
  );
  const slug = router.isReady ? router.query?.stop : earlyStop;

  const selected = stopIndexFor(stops, slug);
  const selectedIndex = selected ?? DEFAULT_STOP_INDEX;

  useSceneCamera(cameras.about);
  useSceneView({ selectedStop: stops[selectedIndex].id });

  /*
   * THE MAP ASKED FOR A STOP; THIS IS THE ANSWER.
   *
   * scene/layers/sets.ts binds the click and scene/MapProvider carries it
   * here as a request rather than as state, because the selection is a
   * URL and only a route can write one. Serving it is a shallow push --
   * the stops are already in this page's props, so a query change must
   * not go back to the server for them -- and then the mailbox is
   * emptied, which is what lets the same stop be clicked twice.
   *
   * By id, not by index: the map knows stops by the id it was given in
   * the source, and a stop whose id is not in this page's props is a
   * request from a layer set that has already moved on. Dropping it is
   * the same as not having heard it.
   */
  useEffect(() => {
    if (stopRequest === null) return;
    requestStop(null);
    const stop = stops.find((entry) => entry.id === stopRequest);
    if (stop === undefined) return;
    void router.push(aboutStopPath(stop), undefined, {
      shallow: true,
    });
  }, [stopRequest, requestStop, router, stops]);

  return (
    <>
      {/* The canonical drops the query: all six deep links are one page. */}
      <PageMeta
        description={ABOUT_DESCRIPTION}
        path={ABOUT_PATH}
        title={ABOUT_WORD}
      />
      <AboutPage
        reduced={reduced}
        selectedIndex={selectedIndex}
        stops={stops}
      />
    </>
  );
};

export default About;

export const getStaticProps: GetStaticProps<
  AboutProps
> = async () => ({
  props: { stops: historyStops },
});
