import {
  useCallback,
  useEffect,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';
import usePopover from 'components/chrome/usePopover';
import {
  applyTheme,
  DEFAULT_THEME,
  isThemeId,
  readStoredTheme,
  THEME_IDS,
  type ThemeId,
} from 'styles/theme-bootstrap';
import { cn } from 'utils/cn';

/*
 * The theme lens: a real eyeball, not a swatch. 34x34, a sclera lit from
 * 32%/26%, an iris wearing --clif-accent through --clif-accent-2 to
 * --iris-rim, fibres, a pupil and two glints. It casts --eye-shadow, the
 * same shadow the mouth casts, so the pair reads as one face.
 *
 * The iris slides 3px left when the panel opens, so the eye looks toward
 * it. Hover grows the ball to 1.08 and press settles it to 1.02, over
 * 180ms cubic-bezier(.165,.84,.44,1) -- growth only; there is no colour
 * disc behind it.
 *
 * Each of the panel's eight rows is an 18px MINIATURE OF THE EYE wearing
 * that theme's own iris, not a colour chip. It gets there for free: the
 * theme scopes in tokens/themes.css are plain [data-theme='x'] selectors,
 * so putting data-theme on the swatch re-scopes every token inside it and
 * the miniature paints itself from the same var() names as the big eye.
 * One theme table, in CSS, never mirrored into JS.
 *
 * Picking does NOT close the panel: themes are meant to be compared back to
 * back, and the tokens crossfade over 400ms (tokens/themes.css) while the
 * camera holds position -- the one case where the scene changes without a
 * camera move.
 */
export const THEME_EVENT = 'oneglobe:theme';

export const EYE_SIZE = 34;
export const PANEL_WIDTH = 318;
export const SWATCH_SIZE = 18;

/** Hover/press growth, shared with the mouth. */
const BALL_MOTION =
  'transition-transform duration-[180ms] ease-[cubic-bezier(.165,.84,.44,1)] hover:scale-[1.08] active:scale-[1.02] motion-reduce:transition-none';

const SCLERA_FILL =
  'radial-gradient(circle at 32% 26%, #ffffff 0%, var(--sclera) 56%, var(--sclera-edge) 100%)';

const IRIS_FILL =
  'radial-gradient(circle at 38% 34%, var(--clif-accent) 0%, var(--clif-accent) 26%, var(--clif-accent-2) 64%, var(--iris-rim) 100%)';

const FIBRES =
  'repeating-conic-gradient(from 0deg, rgba(0,0,0,.26) 0deg 4deg, rgba(255,255,255,.12) 4deg 8deg)';

/** The panel's entry, as the design system's own shorthand. */
const PANEL_ENTER = {
  '--slide-in-from': '10px',
} as CSSProperties;

/*
 * The live theme is not React state: it is the data-theme attribute on
 * <html>, which the blocking bootstrap in styles/theme-bootstrap.ts sets
 * before first paint. The eye subscribes to it rather than mirroring it, so
 * two eyes on one page can never disagree and there is nothing to
 * reconcile on mount.
 */
export const subscribeTheme = (
  onChange: () => void,
): (() => void) => {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
};

export const currentTheme = (): ThemeId => {
  const attribute = document.documentElement.dataset.theme;
  if (isThemeId(attribute)) return attribute;
  // No attribute yet: the harness pages render without _document's script.
  return readStoredTheme() ?? DEFAULT_THEME;
};

/** The server has no document and no storage; it renders the default. */
export const serverTheme = (): ThemeId => DEFAULT_THEME;

/** Sets the attribute, remembers the choice, and tells every listener. */
export const announceTheme = (id: ThemeId): void => {
  applyTheme(id);
  window.dispatchEvent(
    new CustomEvent(THEME_EVENT, { detail: { id } }),
  );
};

export type ThemeEyeProps = {
  /** Pins the shown selection. Left unset, the eye owns it. */
  value?: ThemeId;
  onChange?: (id: ThemeId) => void;
  defaultOpen?: boolean;
  className?: string;
};

export const ThemeEye = ({
  value,
  onChange,
  defaultOpen = false,
  className,
}: ThemeEyeProps) => {
  const { open, toggle } = usePopover(defaultOpen);
  const held = useSyncExternalStore(
    subscribeTheme,
    currentTheme,
    serverTheme,
  );
  const active = value ?? held;

  // Mount does not decide the theme -- the bootstrap already did -- but it
  // does announce it, so the scene and any other lens start in step.
  useEffect(() => announceTheme(currentTheme()), []);

  const pick = useCallback(
    (id: ThemeId) => {
      announceTheme(id);
      onChange?.(id);
    },
    [onChange],
  );

  return (
    <div
      className={cn('relative select-none', className)}
      style={{ width: EYE_SIZE, height: EYE_SIZE }}
    >
      {open ? (
        <div
          className="absolute top-0 right-[56px] z-[9] box-border animate-slide-in-card rounded-[16px_6px_16px_16px] bg-surface-2 p-[13px] shadow-[var(--shadow-panel)] [border:var(--border-cta-soft)]"
          style={{ ...PANEL_ENTER, width: PANEL_WIDTH }}
        >
          <span className="absolute top-[10px] right-[-11px] h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-accent-30" />
          <span className="absolute top-[11px] right-[-9px] h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-surface-2" />

          <div className="mb-[9px] flex items-baseline justify-between">
            <span
              className="text-fg-4 uppercase"
              style={{
                fontSize: 'var(--type-readout-size)',
                letterSpacing: '.26em',
              }}
            >
              theme
            </span>
            <span
              className="text-accent-small"
              style={{
                fontSize: 'var(--type-readout-size)',
                letterSpacing: '.14em',
              }}
            >
              {active}
            </span>
          </div>

          <div
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-[6px] gap-y-[2px]"
            role="listbox"
          >
            {THEME_IDS.map((id) => {
              const on = id === active;
              return (
                <button
                  aria-selected={on}
                  className={cn(
                    'flex cursor-pointer items-center gap-[9px] rounded-[var(--radius-sm)] px-[7px] py-[4px] transition-[background-color,color] duration-[140ms] ease-out motion-reduce:transition-none',
                    on
                      ? 'bg-accent-12 hover:bg-accent-20'
                      : 'hover:bg-accent-07',
                  )}
                  key={id}
                  onClick={() => pick(id)}
                  role="option"
                  type="button"
                >
                  <span
                    className="relative flex-none rounded-full"
                    data-theme={id}
                    style={{
                      width: SWATCH_SIZE,
                      height: SWATCH_SIZE,
                      background: SCLERA_FILL,
                      boxShadow: `inset -2px -2px 5px rgba(0,0,0,.28), inset 2px 2px 4px rgba(255,255,255,.4), 0 0 0 1px ${
                        on
                          ? 'var(--clif-accent)'
                          : 'var(--border-neutral-color)'
                      }`,
                    }}
                  >
                    <span
                      className="absolute top-[5px] left-[4px] h-[9px] w-[9px] overflow-hidden rounded-full"
                      style={{
                        background: IRIS_FILL,
                        boxShadow:
                          'inset 0 -1px 2px rgba(0,0,0,.45), 0 0 0 1px var(--iris-rim)',
                      }}
                    >
                      <span
                        className="absolute inset-0 rounded-full opacity-[.45]"
                        style={{ background: FIBRES }}
                      />
                      <span className="absolute top-[3px] left-[3px] h-[3px] w-[3px] rounded-full bg-[#0b0b0b]" />
                    </span>
                    <span className="absolute top-[3px] left-[4px] h-[3px] w-[5px] rounded-full bg-[rgba(255,255,255,.9)] blur-[.7px]" />
                  </span>
                  <span
                    className={cn(
                      'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap uppercase',
                      on ? 'text-fg-2' : 'text-fg-4',
                    )}
                    style={{
                      fontSize: 'var(--type-readout-size)',
                      letterSpacing: '.1em',
                    }}
                  >
                    {id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <button
        aria-expanded={open}
        aria-label="Theme"
        className={cn(
          'relative block cursor-pointer rounded-full',
          BALL_MOTION,
        )}
        onClick={toggle}
        style={{
          width: EYE_SIZE,
          height: EYE_SIZE,
          background: SCLERA_FILL,
          boxShadow:
            'inset -3px -4px 9px rgba(0,0,0,.30), inset 3px 3px 7px rgba(255,255,255,.42), var(--eye-shadow)',
        }}
        type="button"
      >
        <span
          className="absolute top-[9px] h-[16px] w-[16px] overflow-hidden rounded-full transition-[left] duration-[180ms] ease-out motion-reduce:transition-none"
          style={{
            left: open ? 6 : 9,
            background: IRIS_FILL,
            boxShadow:
              'inset 0 -2px 4px rgba(0,0,0,.45), inset 0 2px 3px rgba(255,255,255,.35), 0 0 0 1px var(--iris-rim)',
          }}
        >
          <span
            className="absolute inset-0 rounded-full opacity-50"
            style={{ background: FIBRES }}
          />
          <span className="absolute top-[5px] left-[5px] h-[6px] w-[6px] rounded-full bg-[#0b0b0b] shadow-[0_0_3px_1px_rgba(0,0,0,.55)]" />
        </span>
        <span className="absolute top-[6px] left-[7px] h-[6px] w-[8px] rounded-full bg-[rgba(255,255,255,.92)] blur-[1.2px]" />
        <span className="absolute right-[8px] bottom-[8px] h-[3px] w-[4px] rounded-full bg-[rgba(255,255,255,.4)] blur-[.8px]" />
      </button>
    </div>
  );
};

export default ThemeEye;
