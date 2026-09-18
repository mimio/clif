import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { Specimen } from 'pagesComponents/specimens/types';
import {
  type CameraSpec,
  cameras,
  type FogColor,
  type FogInk,
  type FogPreset,
  fogPresets,
  SCENE_HANDOFF,
  SCENE_MOVE_LONG_MS,
  SCENE_MOVE_MS,
  type SceneId,
} from 'content/cameras';
import {
  coordLabel,
  forViewport,
  moveDurationFor,
  REDUCED_MOVE_MS,
  SCENE_BY_PATH,
  SCENE_REFRAME_MS,
  terrainFor,
} from 'scene/camera';
import { layerSetsFor } from 'scene/layers/sets';
import { basemapConfig } from 'scene/theme';
import {
  BASEMAP_COLOR_KEYS,
  BASEMAP_COLORS,
  basemapColors,
} from 'styles/tokens/cartography';
import {
  FALLBACK_PALETTE,
  type Palette,
  readPalette,
} from 'styles/tokens/palette';
import {
  applyTheme,
  THEME_IDS,
  type ThemeId,
} from 'styles/theme-bootstrap';

/*
 * Lane 5's section: the scene's decisions, without the scene.
 *
 * Everything the globe does is resolved by pure functions before anything
 * touches mapbox-gl, so all of it can be printed. That is the point of
 * this page: there is no Mapbox token in development, and even with one
 * you cannot read a camera table off a screenshot of a planet.
 *
 * The LUT strip is the one thing here that has to be looked at rather
 * than read. It is the 32 x 1024 cube the basemap is re-tinted with, and
 * if it does not visibly change when the theme does then the globe does
 * not retheme -- and nothing else on the page would say so.
 */

const PATH_BY_SCENE = Object.fromEntries(
  Object.entries(SCENE_BY_PATH).map(([path, id]) => [id, path]),
) as Record<SceneId, string | undefined>;

const SCENE_ORDER: SceneId[] = [
  'hello',
  'projects',
  'projectDetail',
  'about',
  'notFound',
];

const deg = (value: number): string => `${value}°`;

const cell = 'px-3 py-2 align-top text-[11px] whitespace-nowrap';
const head =
  'px-3 pb-2 text-left text-[10px] tracking-[.2em] text-fg-5 uppercase';

const Swatch = ({ color }: { color: string }) => (
  <span
    aria-hidden="true"
    className="mr-2 inline-block h-3 w-3 rounded-[2px] border border-surface-3 align-[-1px]"
    style={{ background: color }}
  />
);

/* ---- the live theme --------------------------------------------------- */

type Snapshot = { theme: string; palette: Palette };

const SERVER: Snapshot = {
  theme: 'yellow',
  palette: FALLBACK_PALETTE,
};

let snapshot: Snapshot = SERVER;

const readSnapshot = (): Snapshot => {
  const theme = document.documentElement.dataset.theme ?? 'yellow';
  if (theme === snapshot.theme) return snapshot;
  snapshot = { theme, palette: readPalette() };
  return snapshot;
};

const subscribe = (onChange: () => void): (() => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => observer.disconnect();
};

const useThemeSnapshot = (): Snapshot =>
  useSyncExternalStore(subscribe, readSnapshot, () => SERVER);

/*
 * The two palettes the preset column is read against.
 *
 * basemapConfig takes a whole palette now, because it sets the
 * cartography as well as the structural knobs -- but this column is only
 * asking what the LIGHT PRESET resolves to, and that turns on
 * palette.light and nothing else. So the flag is flipped directly rather
 * than a second theme's tokens being loaded to imply it.
 */
const DARK_SAMPLE: Palette = { ...FALLBACK_PALETTE, light: false };
const LIGHT_SAMPLE: Palette = { ...FALLBACK_PALETTE, light: true };

/* ---- sections --------------------------------------------------------- */

const CameraTable = ({ mobile }: { mobile: boolean }) => (
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b border-surface-3">
        <th className={head}>scene</th>
        <th className={head}>pathname</th>
        <th className={head}>centre</th>
        <th className={head}>zoom</th>
        <th className={head}>pitch</th>
        <th className={head}>bearing</th>
        <th className={head}>terrain</th>
        <th className={head}>fog</th>
        <th className={head}>map</th>
        <th className={head}>spin</th>
        <th className={head}>move</th>
      </tr>
    </thead>
    <tbody>
      {SCENE_ORDER.map((id) => {
        const spec: CameraSpec = forViewport(cameras[id], id, mobile);
        const terrain = terrainFor(spec);
        return (
          <tr className="border-b border-surface-3" key={id}>
            <td className={`${cell} text-fg`}>{id}</td>
            <td className={`${cell} text-fg-4`}>
              {PATH_BY_SCENE[id] ?? '(anything else)'}
            </td>
            <td className={`${cell} text-fg-3`}>
              {spec.center[0].toFixed(3)}, {spec.center[1].toFixed(3)}
            </td>
            <td className={`${cell} text-fg-2`}>{spec.zoom}</td>
            <td className={`${cell} text-fg-3`}>{deg(spec.pitch)}</td>
            <td className={`${cell} text-fg-3`}>
              {deg(spec.bearing)}
            </td>
            <td className={`${cell} text-fg-3`}>
              {terrain === null ? 'off' : `${terrain}×`}
            </td>
            <td className={`${cell} text-accent-small uppercase`}>
              {spec.fog}
            </td>
            <td className={`${cell} text-fg-3 uppercase`}>
              {coordLabel(spec)}
            </td>
            <td className={`${cell} text-fg-4`}>
              {spec.spinDegPerSecond === null
                ? '—'
                : `${spec.spinDegPerSecond}°/s`}
            </td>
            <td className={`${cell} text-fg-4`}>
              {moveDurationFor(null, id, false)}ms
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

const FogTable = () => (
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b border-surface-3">
        <th className={head}>preset</th>
        <th className={head}>range</th>
        <th className={head}>rim (`color`)</th>
        <th className={head}>halo (`high-color`)</th>
        <th className={head}>reach</th>
        <th className={head}>light preset</th>
        <th className={head}>used by</th>
      </tr>
    </thead>
    <tbody>
      {(Object.keys(fogPresets) as FogPreset[]).map((id) => {
        const fog = fogPresets[id];
        // The colours are the LIVE theme's, because that is the whole
        // point of the change this table documents: nothing here is a
        // fixed hex any more.
        const TOKEN: Record<FogInk, string> = {
          accent: '--clif-accent',
          accent2: '--clif-accent-2',
          space: '--surface-ground',
        };
        const swatch = (color: FogColor) =>
          `color-mix(in srgb, var(${TOKEN[color.ink]}) ${
            color.alpha * 100
          }%, var(--surface-ground))`;
        const label = (color: FogColor) =>
          `${TOKEN[color.ink].replace('--', '')} @ ${color.alpha}`;
        const used = SCENE_ORDER.filter(
          (scene) => cameras[scene].fog === id,
        );
        return (
          <tr className="border-b border-surface-3" key={id}>
            <td className={`${cell} text-fg uppercase`}>{id}</td>
            <td className={`${cell} text-fg-3`}>
              {fog.range.join(' ')}
            </td>
            <td className={`${cell} text-fg-3`}>
              <Swatch color={swatch(fog.color)} />
              {label(fog.color)}
            </td>
            <td className={`${cell} text-fg-3`}>
              <Swatch color={swatch(fog.highColor)} />
              {label(fog.highColor)}
            </td>
            <td className={`${cell} text-fg-4`}>
              {fog.glow.at === 'limb'
                ? `${fog.glow.limbReach}r / ${fog.glow.haloReach}r, solved`
                : `${fog.glow.horizonBlend} (mercator)`}
            </td>
            <td className={`${cell} text-fg-4`}>
              {basemapConfig(id, DARK_SAMPLE).lightPreset} / dark
              {' · '}
              {basemapConfig(id, LIGHT_SAMPLE).lightPreset} / light
            </td>
            <td className={`${cell} text-fg-4`}>{used.join(', ')}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

const LayerTable = () => {
  const noop = () => {};
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-surface-3">
          <th className={head}>scene</th>
          <th className={head}>layer set</th>
          <th className={head}>layers</th>
          <th className={head}>handlers</th>
        </tr>
      </thead>
      <tbody>
        {SCENE_ORDER.map((id) => {
          const sets = layerSetsFor(id, {
            palette: FALLBACK_PALETTE,
            hover: null,
            labels: true,
            selectedStop: null,
            onHoverAnchor: noop,
            onSelectAnchor: noop,
            onSelectStop: noop,
          });
          return (
            <tr className="border-b border-surface-3" key={id}>
              <td className={`${cell} text-fg`}>{id}</td>
              <td className={`${cell} text-fg-3`}>
                {sets.map((one) => one.id).join(', ') || '—'}
              </td>
              <td className="px-3 py-2 align-top text-[11px] text-fg-4">
                {sets
                  .flatMap((one) =>
                    one.layers.map((entry) => entry.id),
                  )
                  .join(', ') || '—'}
              </td>
              <td className={`${cell} text-fg-4`}>
                {sets
                  .flatMap((one) =>
                    one.interactions.map(
                      (it) => `${it.type}@${it.layer ?? 'map'}`,
                    ),
                  )
                  .join(', ') || '—'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

/*
 * The basemap, as the colours it is actually painted in.
 *
 * This is the specimen that replaced the LUT strip, and it is a better
 * one for the same reason the change was worth making: a cube strip
 * showed what the grade DID to Mapbox's colours, which nobody could read
 * back to a feature. These are the features, named, in the colour each
 * one wears -- so "what is a forest on teal" is a question the page
 * answers rather than implies.
 *
 * Every key Standard has is here, including the two pairs that share a
 * token, because a swatch that appears twice is the honest picture of a
 * design that made one decision for both.
 */
const SurfaceRow = ({ palette }: { palette: Palette }) => {
  const colors = basemapColors(palette);
  return (
    <div className="grid grid-cols-4 gap-2 max-tablet:grid-cols-2">
      {BASEMAP_COLOR_KEYS.map((key) => (
        <div key={key}>
          <div
            aria-label={`${key} is ${colors[key]}`}
            className="h-8 w-full rounded-sm border border-surface-3"
            role="img"
            style={{ background: colors[key] }}
          />
          <code className="block text-[10px] text-fg-4">{key}</code>
          <code className="block text-[10px] text-fg-5">
            --map-{BASEMAP_COLORS[key]} {colors[key]}
          </code>
        </div>
      ))}
    </div>
  );
};

/*
 * Every theme's cartography at once.
 *
 * The themes.css selectors are plain attribute selectors, not :root
 * rules, so a hidden div carrying data-theme="lime" resolves the lime
 * token scope -- and readPalette takes the element to read. That is how
 * eight palettes are read without ever touching the live theme, which is
 * both a render side effect and a flash of seven wrong themes.
 *
 * If two of these rows look the same, the globe does not retheme
 * between those two.
 */
const AllSurfaces = ({ active }: { active: string }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<
    { id: string; palette: Palette }[]
  >([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    setRows(
      THEME_IDS.map((id) => {
        const probe = host.querySelector<HTMLElement>(
          `[data-theme="${id}"]`,
        );
        return {
          id,
          palette: readPalette(probe ?? document.documentElement),
        };
      }),
    );
  }, []);

  return (
    <>
      <div aria-hidden="true" className="hidden" ref={hostRef}>
        {THEME_IDS.map((id) => (
          <div data-theme={id} key={id} />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.id}>
            <code className="block pb-1 text-[10px] text-fg-3">
              {row.id === active ? `${row.id} (live)` : row.id}
            </code>
            <SurfaceRow palette={row.palette} />
          </div>
        ))}
      </div>
    </>
  );
};

const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) => (
  <section className="mb-7">
    <h3 className="mb-1 text-[12px] tracking-[.2em] text-fg uppercase">
      {title}
    </h3>
    {note === undefined ? null : (
      <p className="mb-2 text-[11px] text-fg-4">{note}</p>
    )}
    {children}
  </section>
);

const Scene = () => {
  const { theme, palette } = useThemeSnapshot();

  return (
    <div className="bg-surface p-4 text-fg-2">
      <div className="mb-6 flex flex-wrap gap-2">
        {THEME_IDS.map((id) => (
          <button
            className="rounded-sm border px-3 py-1 text-[11px] tracking-[.16em] uppercase transition-hue"
            key={id}
            onClick={() => applyTheme(id as ThemeId)}
            style={{
              borderColor:
                id === theme
                  ? 'var(--clif-accent)'
                  : 'var(--border-neutral-color)',
              backgroundColor:
                id === theme
                  ? 'var(--cta-fill)'
                  : 'var(--cta-fill-ghost)',
              color:
                id === theme
                  ? 'var(--text-on-accent)'
                  : 'var(--text-body)',
            }}
            type="button"
          >
            {id}
          </button>
        ))}
      </div>

      <Section
        note="One map instance. Every route change is an easeTo on cubic-bezier(.65,0,.35,1). SceneRoot resolves the pathname against this table; a page refines only the centre."
        title="Cameras — desktop"
      >
        <CameraTable mobile={false} />
      </Section>

      <Section
        note="Not separate scenes: the same fog, terrain flag and interactivity, reframed. Terrain exaggeration drops to 1.0 on every route that has terrain."
        title="Cameras — below 650px"
      >
        <CameraTable mobile />
      </Section>

      <Section
        note={`${SCENE_MOVE_MS}ms between routes · ${SCENE_MOVE_LONG_MS}ms into the detail and out of the 404 · ${SCENE_REFRAME_MS}ms for a reframe inside a route (a hover nudge, a selected stop) · ${REDUCED_MOVE_MS}ms under reduced motion, which is a crossfade rather than a move. The foreground starts entering at ${SCENE_HANDOFF * 100}% of the scene move.`}
        title="Durations"
      >
        <p className="text-[11px] text-fg-3">
          Hovering a project eases the camera 8% toward its anchor
          city and lights that point; hovering out reverses.
        </p>
      </Section>

      <Section
        note="Each route names one preset. The light preset is Standard's own sun position, set through setConfigProperty — the cheap tier, no tile reload."
        title="Fog presets"
      >
        <FogTable />
      </Section>

      <Section
        note="SceneRoot diffs the active sets against the mounted ones. Every handler is registered through the set's registry, so teardown is total."
        title="Layer sets"
      >
        <LayerTable />
      </Section>

      <Section
        note="A route declares the camera through useSceneCamera, and everything else through useSceneView. Both are declarative and both are taken back when the route unmounts; neither moves the camera except useSceneCamera."
        title="What a route declares"
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-surface-3">
              <th className={head}>route</th>
              <th className={head}>call</th>
              <th className={head}>why</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-surface-3">
              <td className={`${cell} text-fg`}>projects</td>
              <td className="px-3 py-2 align-top text-[11px] text-fg-2">
                <code>{'useSceneView({ labels: !browseAll })'}</code>
              </td>
              <td className="px-3 py-2 align-top text-[11px] text-fg-4">
                1c: at full bleed the table overprints the map type.
                ANDed with the viewport, which suppresses it below
                650px on its own (1g).
              </td>
            </tr>
            <tr className="border-b border-surface-3">
              <td className={`${cell} text-fg`}>about</td>
              <td className="px-3 py-2 align-top text-[11px] text-fg-2">
                <code>{'useSceneView({ selectedStop: id })'}</code>
              </td>
              <td className="px-3 py-2 align-top text-[11px] text-fg-4">
                1e: the live element is the SELECTED stop, so the map
                tracks the sheet and the scrubber rather than the
                current job.
              </td>
            </tr>
            <tr className="border-b border-surface-3">
              <td className={`${cell} text-fg`}>detail</td>
              <td className="px-3 py-2 align-top text-[11px] text-fg-2">
                <code>
                  {'useSceneCamera(cameraAt(spec, centre))'}
                </code>
              </td>
              <td className="px-3 py-2 align-top text-[11px] text-fg-4">
                A refinement may move the centre and nothing else, or
                it is treated as a camera left behind by the last
                route.
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section
        note="One setConfigProperty per key on the Mapbox Standard basemap import, straight from this theme's map tokens. These are the colours the globe is painted in, not a grade over Mapbox's own: nothing reloads a tile, and a forest is whatever shade of the theme the token says."
        title="Basemap cartography — live"
      >
        <SurfaceRow palette={palette} />
      </Section>

      <Section
        note="If two of these look the same, the globe does not retheme between those two. Edit the --map-* tokens in styles/tokens/themes.css to move them."
        title="Basemap cartography — all eight themes"
      >
        <AllSurfaces active={theme} />
      </Section>
    </div>
  );
};

export const scene: Specimen = {
  id: 'scene',
  title: 'Scene',
  note: "Camera table, fog presets and the basemap's own cartography.",
  render: () => <Scene />,
};

export default scene;
