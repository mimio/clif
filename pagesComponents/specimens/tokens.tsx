import { useSyncExternalStore } from 'react';
import type { Specimen } from 'pagesComponents/specimens/types';
import { buildLut } from 'styles/tokens/lut';
import { readPalette } from 'styles/tokens/palette';
import {
  applyTheme,
  THEME_IDS,
  type ThemeId,
} from 'styles/theme-bootstrap';

/*
 * Lane B's section: the token layer, every token, under whichever theme is
 * on <html>.
 *
 * It exists to be looked at under all eight data-theme values. Two things
 * it is meant to catch: a token that does not retheme (the whole point of
 * the colors.css rederivations -- those are marked "gap" below), and a
 * text colour that stops being legible on a light ground.
 *
 * Every swatch prints its own computed value, so the page is also the
 * fastest way to see what a token actually resolves to in a given theme.
 */

type Group = {
  title: string;
  note?: string;
  tokens: string[];
  /** Renders each swatch as text rather than a block of colour. */
  asText?: boolean;
  /** The token is a gradient, a shadow or a scrim, not a flat colour. */
  kind?: 'color' | 'image' | 'shadow' | 'raw';
};

const GROUPS: Group[] = [
  {
    title: 'Accent',
    note: 'The ladder is baked per theme. Never build a step with an opacity modifier.',
    tokens: [
      '--clif-accent',
      '--clif-accent-2',
      '--clif-yellow-100',
      '--clif-yellow-60',
      '--clif-yellow-35',
      '--clif-yellow-30',
      '--clif-yellow-20',
      '--clif-yellow-12',
      '--clif-yellow-07',
      '--accent2-line',
      '--accent2-solid',
      '--iris-rim',
    ],
  },
  {
    title: 'Surfaces',
    tokens: [
      '--surface-ground',
      '--surface-raised',
      '--surface-hover',
      '--surface-sheet',
      '--border-color',
      '--border-neutral-color',
      '--surface-control-backdrop',
      '--surface-vignette',
    ],
  },
  {
    title: 'Text',
    note: 'Read these, do not just look at them: every one has to stay legible on both grounds.',
    asText: true,
    tokens: [
      '--text-strong',
      '--text-body',
      '--text-secondary',
      '--text-muted',
      '--text-faint',
      '--text-accent',
      '--text-accent-small',
      '--accent2-text',
      '--ink-on-dark',
      '--ink-on-dark-muted',
    ],
  },
  {
    title: 'Interactive — gap 9, rederived',
    note: 'These never rethemed in the bundle. Every one should follow the accent now.',
    tokens: [
      '--cta-fill',
      '--cta-fill-soft',
      '--cta-fill-ghost',
      '--cta-underline',
      '--scroll-rest',
      '--scroll-hover',
      '--scroll-active',
    ],
  },
  {
    title: 'Map — gap 9, rederived',
    tokens: [
      '--map-space',
      '--map-land',
      '--map-deep',
      '--map-water',
      '--map-path',
      '--map-point-rest',
      '--map-point-live',
      '--map-contour',
      '--map-atmosphere',
      '--map-atmosphere-2',
    ],
  },
  {
    title: 'Keycap',
    tokens: [
      '--cap-skirt',
      '--cap-well',
      '--cap-face-solid-top',
      '--cap-face-solid-bottom',
      '--cap-face-top',
      '--cap-face-top-hot',
      '--cap-wall-top',
      '--cap-wall-bottom',
      '--cap-ink',
      '--cap2-ink',
      '--cap-ink-hot',
      '--tab-fill',
      '--tab-ink',
      '--sclera',
      '--sclera-edge',
      '--lip',
      '--lip-hi',
      '--lip-lo',
    ],
  },
  {
    title: 'Gradients',
    kind: 'image',
    tokens: [
      '--grad-word',
      '--grad-word-on-dark',
      '--grad-ground',
      '--grad-horizon',
      '--grad-card',
    ],
  },
  {
    title: 'Scrims',
    kind: 'image',
    tokens: [
      '--vignette-left',
      '--vignette-night',
      '--vignette-atmosphere',
      '--chrome-scrim',
      '--scrim-wide',
      '--scrim-center',
      '--scrim-sheet',
    ],
  },
  {
    title: 'Shadow',
    kind: 'shadow',
    tokens: [
      '--shadow-panel',
      '--shadow-plane',
      '--eye-shadow',
      '--shadow-cast',
    ],
  },
  {
    title: 'Borders, radii, motion, scene',
    kind: 'raw',
    tokens: [
      '--border-width',
      '--border-cta',
      '--border-cta-soft',
      '--border-neutral',
      '--border-content',
      '--radius-card',
      '--radius-control',
      '--radius-pill',
      '--radius-sm',
      '--radius-xs',
      '--radius-control-bar',
      '--speed-short',
      '--speed-long',
      '--enter-page',
      '--scene-move',
      '--scene-ease',
      '--fog-space-range',
      '--terrain-exaggeration',
      '--dpr-clamp',
    ],
  },
  {
    title: 'Type scale and spacing',
    kind: 'raw',
    tokens: [
      '--family-display',
      '--family-mono',
      '--weight-light',
      '--weight-regular',
      '--weight-bold',
      '--type-heading-size',
      '--type-heading2-size',
      '--type-subheader-size',
      '--type-body-size',
      '--type-detail-size',
      '--type-label-size',
      '--type-readout-size',
      '--type-caption-size',
      '--type-micro-size',
      '--space-4',
      '--space-16',
      '--foreground-left',
      '--foreground-top',
      '--chrome-inset',
    ],
  },
];

const ALL_TOKENS = GROUPS.flatMap((group) => group.tokens);

/*
 * Reading the live token scope is a read of an external system -- the
 * document -- so it goes through useSyncExternalStore rather than an
 * effect that calls setState. The MutationObserver means the page also
 * follows a theme change made from anywhere else: the switcher below, the
 * chrome's theme lens, or devtools.
 */
type Snapshot = {
  theme: string;
  values: Record<string, string>;
  lut: string;
};

const SERVER_SNAPSHOT: Snapshot = {
  theme: 'yellow',
  values: {},
  lut: '',
};

let snapshot: Snapshot = SERVER_SNAPSHOT;

const readSnapshot = (): Snapshot => {
  const theme = document.documentElement.dataset.theme ?? 'yellow';
  if (theme === snapshot.theme && snapshot.lut !== '')
    return snapshot;
  const style = getComputedStyle(document.documentElement);
  const values: Record<string, string> = {};
  for (const token of ALL_TOKENS) {
    values[token] = style.getPropertyValue(token).trim();
  }
  snapshot = { theme, values, lut: buildLut(readPalette()) };
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

const useTokenSnapshot = (): Snapshot =>
  useSyncExternalStore(
    subscribe,
    readSnapshot,
    () => SERVER_SNAPSHOT,
  );

const Chip = ({
  group,
  token,
  value,
}: {
  group: Group;
  token: string;
  value: string;
}) => {
  const label = (
    <>
      <code className="block truncate text-[10px] text-fg-3">
        {token}
      </code>
      <code className="block truncate text-[9px] text-fg-5">
        {value || '—'}
      </code>
    </>
  );

  if (group.asText) {
    return (
      <div className="min-w-0">
        <p
          className="truncate text-[15px]"
          style={{ color: `var(${token})` }}
        >
          The quick brown fox
        </p>
        {label}
      </div>
    );
  }

  if (group.kind === 'raw') {
    return (
      <div className="min-w-0 rounded-sm border border-surface-3 p-2">
        {label}
      </div>
    );
  }

  const swatch =
    group.kind === 'image'
      ? { backgroundImage: `var(${token})` }
      : group.kind === 'shadow'
        ? {
            backgroundColor: 'var(--surface-raised)',
            boxShadow: `var(${token})`,
          }
        : { backgroundColor: `var(${token})` };

  return (
    <div className="min-w-0">
      <div
        className="mb-1 h-12 rounded-sm border border-surface-3"
        style={swatch}
      />
      {label}
    </div>
  );
};

const ThemeRow = ({
  active,
  onPick,
}: {
  active: string;
  onPick: (id: ThemeId) => void;
}) => (
  <div className="mb-6 flex flex-wrap gap-2">
    {THEME_IDS.map((id) => (
      <button
        key={id}
        type="button"
        onClick={() => onPick(id)}
        className="rounded-sm border px-3 py-1 text-[11px] tracking-[.16em] uppercase transition-hue"
        style={{
          borderColor:
            id === active
              ? 'var(--clif-accent)'
              : 'var(--border-neutral-color)',
          backgroundColor:
            id === active
              ? 'var(--cta-fill)'
              : 'var(--cta-fill-ghost)',
          color:
            id === active
              ? 'var(--text-on-accent)'
              : 'var(--text-body)',
        }}
      >
        {id}
      </button>
    ))}
  </div>
);

/*
 * The Mapbox colour-theme LUT, drawn as the 32 x 1024 strip it is. It is
 * here because it is the one token consumer with no CSS at all: if the
 * strip does not change when the theme does, buildLut is reading a stale
 * palette.
 */
const LutStrip = ({ lut }: { lut: string }) => (
  <div>
    <div
      className="h-16 w-full rounded-sm border border-surface-3 bg-cover [image-rendering:pixelated]"
      role="img"
      aria-label="Mapbox colour-theme LUT for the active theme"
      style={{ backgroundImage: `url(data:image/png;base64,${lut})` }}
    />
    <code className="block text-[10px] text-fg-3">
      buildLut(readPalette()) — 32 x 1024 cube strip
    </code>
  </div>
);

const Tokens = () => {
  const { theme, values, lut } = useTokenSnapshot();

  return (
    <div className="bg-surface p-4 text-fg-2">
      <ThemeRow active={theme} onPick={applyTheme} />
      {GROUPS.map((group) => (
        <section className="mb-6" key={group.title}>
          <h3 className="mb-1 text-[12px] tracking-[.2em] text-fg uppercase">
            {group.title}
          </h3>
          {group.note === undefined ? null : (
            <p className="mb-2 text-[11px] text-fg-4">{group.note}</p>
          )}
          <div className="grid grid-cols-6 gap-3 max-desktop:grid-cols-4 max-tablet:grid-cols-2">
            {group.tokens.map((token) => (
              <Chip
                group={group}
                key={token}
                token={token}
                value={values[token] ?? ''}
              />
            ))}
          </div>
        </section>
      ))}
      <section className="mb-6">
        <h3 className="mb-1 text-[12px] tracking-[.2em] text-fg uppercase">
          Mapbox LUT
        </h3>
        <LutStrip lut={lut} />
      </section>
      <section>
        <h3 className="mb-1 text-[12px] tracking-[.2em] text-fg uppercase">
          On the raised surface
        </h3>
        <div className="rounded-sm bg-surface-2 p-4">
          <p className="text-fg">strong — the loudest ink there is</p>
          <p className="text-fg-2">
            body — eighteen over twenty-eight
          </p>
          <p className="text-fg-3">secondary — captions and meta</p>
          <p className="text-fg-4">
            muted — the quietest legible step
          </p>
          <p className="text-accent-small">
            accent-small — the 4.5:1 step for 11px type
          </p>
          <p className="mt-2 inline-block bg-accent px-2 py-1 text-on-accent">
            on-accent — ink on the fill
          </p>
        </div>
      </section>
    </div>
  );
};

export const tokens: Specimen = {
  id: 'tokens',
  title: 'Tokens',
  note: 'The whole token layer under the live theme, with computed values.',
  render: () => <Tokens />,
};

export default tokens;
