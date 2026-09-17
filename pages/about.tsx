import { useCallback, useMemo } from 'react';
import type { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { cameras } from 'content/cameras';
import { historyStops, type HistoryStop } from 'content/history';
import AboutPage, {
  ABOUT_PATH,
  aboutStopPath,
  DEFAULT_STOP_INDEX,
  stopIndexFor,
} from 'pagesComponents/about';
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

type AboutProps = {
  stops: HistoryStop[];
};

const About = ({ stops }: AboutProps) => {
  const router = useRouter();
  const mobile = useIsMobile();
  const reduced = useReducedMotion();

  // `query` is empty on the static render and filled on hydration, so a
  // deep-linked stop arrives one paint after the fit view.
  const selected = stopIndexFor(stops, router.query?.stop);
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
    <AboutPage
      mobile={mobile}
      onFit={fit}
      onSelectStop={select}
      reduced={reduced}
      selectedIndex={selectedIndex}
      stops={stops}
    />
  );
};

export default About;

export const getStaticProps: GetStaticProps<
  AboutProps
> = async () => ({
  props: { stops: historyStops },
});
