import { useState } from 'react';
import Text from 'components/primitives/Text';
import {
  applyTheme,
  DEFAULT_THEME,
  THEME_IDS,
  type ThemeId,
} from 'styles/theme-bootstrap';
import { cn } from 'utils/cn';

/*
 * The theme lens. A 34x34 eyeball whose iris wears the current accent; the
 * iris slides 3px left when the panel opens, so the eye looks toward it.
 * Hover scales the ball 1.08, press 1.02, both over
 * 180ms cubic-bezier(.165,.84,.44,1).
 *
 * The panel is 318px, eight rows, no helper copy. Each row's swatch is an
 * 18px miniature of the eye wearing that theme's own iris, not a colour chip.
 * Picking a theme does NOT close the panel -- themes are meant to be compared
 * back to back -- and the tokens crossfade over 400ms while the camera holds
 * position: the one case where the scene changes without a camera move.
 */
export type ThemeEyeProps = {
  value?: ThemeId;
  onChange?: (id: ThemeId) => void;
  defaultOpen?: boolean;
  className?: string;
};

export const ThemeEye = ({
  value = DEFAULT_THEME,
  onChange,
  defaultOpen = false,
  className,
}: ThemeEyeProps) => {
  const [open, setOpen] = useState(defaultOpen);

  const pick = (id: ThemeId) => {
    applyTheme(id);
    onChange?.(id);
  };

  return (
    <div className={cn('clif-theme-eye', className)}>
      <button
        aria-expanded={open}
        aria-label="Theme"
        className="clif-theme-eye-ball"
        data-open={open}
        onClick={() => setOpen(!open)}
        type="button"
      />
      {open ? (
        <div className="clif-theme-eye-panel" role="listbox">
          <Text variant="label">theme</Text>
          {THEME_IDS.map((id) => (
            <button
              aria-selected={id === value}
              key={id}
              onClick={() => pick(id)}
              role="option"
              type="button"
            >
              {id}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ThemeEye;
