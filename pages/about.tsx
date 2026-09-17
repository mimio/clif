import { useCallback, useMemo, useSyncExternalStore } from 'react';
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
  aboutStopPath,
  DEFAULT_STOP_INDEX,
  stopIndexFor,
} from 'pagesComponents/about';
import { PageMeta } from 'pages/_app';
import { cameraAt } from 'scene/camera';
import { useSceneView } from 'scene/MapProvider';
import { useSceneCamera } from 'scene/useSceneCamera';
import { useIsMobile, useReducedMotion } from 'scene/useViewport';

/*
 * The selected stop is a URL, not component state: /about?stop=ubiquiti.
 * That makes a stop linkable, makes the browser's back button walk the
 * timeline the way the pager does, and lets the sheet's prev/next be real
 * links rather than buttons that look like them.
 *
 * Bare /about is the FIT view. The sheet still opens on Ubiquiti -- both
 * artboards draw it that way -- but the camera keeps 1e's resting centre,
 * which is the framing that holds all six stops. Selecting a stop refines
 * that camera to the stop's own coordinate and nothing else, which is what
 * scene/camera's refinement rule looks for; it arrives as the 600ms
 * reframe because the route has not changed.
 *
 * The map's one live element is the same stop the sheet and the scrubber
 * are showing -- 1e's yellow budget allows exactly one, and on this route
 * it is the selected point. It is declared even in the fit view, because
 * the fit view IS 1e: the resting centre with Ubiquiti lit. The scene
 * takes the stop's id, not the slug the URL carries, so it is read off the
 * stop rather than passed through from the query.
 */

/*
 * READING THE DEEP LINK BEFORE THE FIRST PAINT.
 *
 * `router.query` is empty on the static render AND on the first client
 * render: with a query string in the URL the Next router starts
 * `isReady: false` and fills the query a task later. A route that reads
 * only `router.query` therefore opens /about?stop=nike on Ubiquiti, moves
 * the camera to the fit view, and only then reframes -- two camera moves
 * for one arrival, the globe's one live point lit on the wrong stop first,
 * and ~190ms of the wrong sheet on screen.
 *
 * The URL itself is not late; only the router's copy of it is. So the slug
 * is read straight off `location.search` through useSyncExternalStore,
 * whose server snapshot is the empty one the static HTML was built with.
 * That is the hydration-safe way to know something the server could not:
 * React renders the server value, notices the snapshots disagree and
 * re-renders synchronously, before the browser paints and -- what actually
 * kills the second camera move -- before any passive effect has run, which
 * is where SceneRoot constructs the map. The map goes live already knowing
 * which stop this is, so it makes the one 800ms flight and no reframe.
 *
 * Once the router IS ready it takes over: it is the only one of the two
 * that sees a shallow push, which is how the scrubber and the pager
 * change stops without a navigation.
 *
 * WHAT THIS DOES NOT FIX, and the trade: the server HTML. /about is
 * getStaticProps, so one file answers all six deep links and a no-JS
 * reader still gets stop 04. getServerSideProps would fix that, at the
 * cost of taking the one page with the heaviest camera off the static
 * build and putting a server round trip in front of a document whose six
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
  const mobile = useIsMobile();
  const reduced = useReducedMotion();

  const earlyStop = useSyncExternalStore(
    subscribeToNothing,
    stopFromLocation,
    noStopOnTheServer,
  );
  const slug = router.isReady ? router.query?.stop : earlyStop;

  const selected = stopIndexFor(stops, slug);
  const selectedIndex = selected ?? DEFAULT_STOP_INDEX;

  const camera = useMemo(
    () =>
      selected === null
        ? cameras.about
        : cameraAt(cameras.about, stops[selected].coordinates),
    [selected, stops],
  );
  useSceneCamera(camera);
  useSceneView({ selectedStop: stops[selectedIndex].id });

  const select = useCallback(
    (index: number) => {
      void router.push(aboutStopPath(stops[index]), undefined, {
        // The stops are already in this page's props; a query change must
        // not go back to the server for them.
        shallow: true,
      });
    },
    [router, stops],
  );

  const fit = useCallback(() => {
    void router.push(ABOUT_PATH, undefined, { shallow: true });
  }, [router]);

  return (
    <>
      {/* The canonical drops the query: all six deep links are one page. */}
      <PageMeta
        description={ABOUT_DESCRIPTION}
        path={ABOUT_PATH}
        title="about"
      />
      <AboutPage
        mobile={mobile}
        onFit={fit}
        onSelectStop={select}
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
