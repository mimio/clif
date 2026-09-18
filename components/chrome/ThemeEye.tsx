import {
  useCallback,
  useEffect,
  useId,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';
import usePopover from 'components/chrome/usePopover';
import {
  announceThemeEvent,
  applyTheme,
  DEFAULT_THEME,
  isThemeId,
  readStoredTheme,
  subscribeTheme,
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
 * THE PANEL IS A NAMED GROUP OF TOGGLES, not a listbox. It used to carry
 * role="listbox" over role="option", which promises a keyboard model this
 * widget does not have: no arrow keys, no aria-activedescendant, no roving
 * tabindex, and no accessible name on the list either. The roles made it
 * WORSE than the plain buttons underneath -- a screen reader switched into
 * forms mode expecting arrows, and the arrows did nothing -- while Tab
 * already reached all eight, because each row is a real button. So the
 * roles are gone: a role="group" named by the panel's own visible caption,
 * holding eight buttons that report aria-pressed. No aria-haspopup on the
 * eye either; this is a disclosure, not a combobox.
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
 * camera move. Escape closes it (usePopover).
 *
 * THE TRIGGER COMES FIRST IN THE DOM and the panel follows it, even though
 * the panel is drawn above and to the left. Tab order is DOM order: with
 * the panel first, tabbing forward off the eye left the component entirely
 * and landed on the mouth, and the eight themes could only be reached by
 * shift-tabbing backwards past the trigger that had just opened them.
 * Nothing about the layout depends on the order -- the panel is absolutely
 * positioned and carries its own z-index.
 */
export const EYE_SIZE = 34;
export const PANEL_WIDTH = 318;
export const SWATCH_SIZE = 18;

/*
 * Hover/press growth, shared with the mouth. The growth is scoped to a fine
 * pointer: the site's `hover` variant is bare `:hover` with no
 * `(hover: hover)` guard, so on a touch screen the tap that opened the
 * panel left the eye stuck 8% oversized until the next tap elsewhere -- and
 * these two sit inside a wrapper that only scales BELOW 650px, which is
 * exactly the touch viewport. Press still answers a finger.
 *
 * ...and hover is scoped to `not-active:` as well, because the two write
 * the SAME property with EQUAL specificity and the press scale is the
 * smaller of the two. Tailwind emits its `@media (pointer: fine)` block
 * after every unconditional rule, so the fine-pointer hover rule for the
 * 1.08 scale was beating the press rule for the 1.02 one, and a pressed
 * ball simply stayed at 1.08 -- the mouse could never produce the press
 * state at all. Excluding :active from the hover selector settles it by
 * condition rather than by the compiler's emit order, which is the point:
 * nothing then depends on how Tailwind chooses to sort its output. Same
 * defect, same fix and the same reasoning as
 * components/primitives/Button/keycap.ts, which has the long version;
 * measured in e2e/hermetic/press-state.spec.ts.
 */
export const BALL_MOTION =
  'transition-transform duration-[180ms] ease-[cubic-bezier(.165,.84,.44,1)] pointer-fine:not-active:hover:scale-[1.08] active:scale-[1.02] motion-reduce:transition-none';

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
export const currentTheme = (): ThemeId => {
  const attribute = document.documentElement.dataset.theme;
  if (isThemeId(attribute)) return attribute;
  // No attribute yet: the harness pages render without _document's script.
  return readStoredTheme() ?? DEFAULT_THEME;
};

/** The server has no document and no storage; it renders the default. */
export const serverTheme = (): ThemeId => DEFAULT_THEME;

/**
 * Sets the attribute and tells every listener, WITHOUT recording a choice.
 * This is what mount uses: the theme it is publishing is whatever the
 * bootstrap already resolved, which for a first-time visitor is just
 * DEFAULT_THEME. Writing that to storage would pin every first visit to
 * today's default, so a later change to the constant would reach nobody who
 * had ever loaded the site -- and applyTheme's own contract is that it
 * remembers a CHOICE.
 */
export const publishTheme = (id: ThemeId): void => {
  document.documentElement.dataset.theme = id;
  announceThemeEvent(id);
};

/** Sets the attribute, remembers the choice, and tells every listener. */
export const announceTheme = (id: ThemeId): void => {
  applyTheme(id);
  announceThemeEvent(id);
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
  // The panel's visible caption names the group, so the name a screen
  // reader announces and the word on screen cannot drift apart.
  const captionId = `clif-theme-${useId().replace(/:/g, '')}`;
  const held = useSyncExternalStore(
    subscribeTheme,
    currentTheme,
    serverTheme,
  );
  const active = value ?? held;

  // Mount does not decide the theme -- the bootstrap already did -- but it
  // does publish it, so the scene and any other lens start in step. It does
  // not persist it: nobody has chosen anything yet.
  useEffect(() => publishTheme(currentTheme()), []);

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

      {open ? (
        <div
          className="absolute top-0 right-[56px] z-[9] box-border animate-slide-in-card rounded-[16px_6px_16px_16px] bg-surface-2 p-[13px] shadow-[var(--shadow-panel)] [border:var(--border-cta-soft)]"
          style={{ ...PANEL_ENTER, width: PANEL_WIDTH }}
        >
          {/*
            The tail, in three parts, and the order is the whole point.
            The panel's border is 30% accent (--border-cta-soft) and so is
            the tail's edge, and the edge triangle's base sat ON that
            border: two translucent paints of the same colour, compositing
            to ~51% in the two shoulders the fill triangle does not reach,
            which lit a bright 1px point at each of the joints where the
            tail meets the body.

            So the border is ERASED first, across exactly the 14px the edge
            triangle's base covers, and the edge is drawn over the gap. Now
            every part of the outline is a single 30% paint and the border
            butts into the tail's shoulders instead of running under them.
            The strip is 2px wide to land its outer edge on the border's
            outer edge; the inner pixel falls on the panel's own padding,
            which is this colour already.
          */}
          <span className="absolute top-[10px] right-[-1px] h-[14px] w-[2px] bg-surface-2" />
          <span className="absolute top-[10px] right-[-11px] h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-accent-30" />
          <span className="absolute top-[11px] right-[-9px] h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-surface-2" />

          <div className="mb-[9px] flex items-baseline justify-between">
            <span
              className="text-fg-4 uppercase"
              id={captionId}
              style={{
                fontSize: 'var(--type-micro-size)',
                letterSpacing: 'var(--type-micro-tracking)',
              }}
            >
              theme
            </span>
            <span
              className="text-accent-small"
              style={{
                fontSize: 'var(--type-micro-size)',
                letterSpacing: '.14em',
              }}
            >
              {active}
            </span>
          </div>

          <div
            aria-labelledby={captionId}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-[6px] gap-y-[2px]"
            role="group"
          >
            {THEME_IDS.map((id) => {
              const on = id === active;
              return (
                <button
                  aria-pressed={on}
                  className={cn(
                    'flex cursor-pointer items-center gap-[9px] rounded-[var(--radius-sm)] px-[7px] py-[4px] transition-[background-color,color] duration-[140ms] ease-out motion-reduce:transition-none',
                    on
                      ? 'bg-accent-12 pointer-fine:hover:bg-accent-20'
                      : 'pointer-fine:hover:bg-accent-07',
                  )}
                  key={id}
                  onClick={() => pick(id)}
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
                      fontSize: 'var(--type-micro-size)',
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
    </div>
  );
};

export default ThemeEye;
