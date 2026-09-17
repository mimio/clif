import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import usePopover from 'components/chrome/usePopover';
import { EMAIL, MAILTO } from 'content/contact';
import { cn } from 'utils/cn';

/*
 * The mouth. Same 3D family as the eye, same 34px width, same
 * 180ms cubic-bezier(.165,.84,.44,1) growth and the same --eye-shadow, so
 * the two read as one face rather than two controls.
 *
 * Closed it is a shut mouth: a 3px lip-line at top 10.5 with no teeth
 * showing. Open, the aperture lifts to top 6 and grows to 12px and two rows
 * of teeth appear inside it.
 *
 * The panel is the mouth speaking, so it has speech-bubble geometry: 16px
 * corners with the one nearest the mouth cut to 6px, and a two-triangle
 * tail on the bottom right pointing back at the lips. Copy is the bundle's
 * lorem ipsum.
 *
 * The copy button is a fixed 58px and its label is centred, so `copy`
 * flipping to `copied` for 1600ms cannot shift the row.
 */
export const COPIED_MS = 1600;

export const MOUTH_WIDTH = 34;
export const MOUTH_HEIGHT = 34;
export const PANEL_WIDTH = 262;
export const COPY_WIDTH = 58;

const LIPS_FILL =
  'radial-gradient(ellipse at 34% 24%, var(--lip-hi) 0%, var(--lip) 52%, var(--lip-lo) 100%)';

const APERTURE_FILL =
  'radial-gradient(ellipse at 50% 18%, #3A0F12 0%, #1A0507 70%, #0B0203 100%)';

const PANEL_ENTER = {
  '--slide-in-from': '10px',
} as CSSProperties;

/** Clipboard first, a hidden textarea where it is blocked. */
export const copyText = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Insecure origin, denied permission, or no clipboard at all.
  }
  const field = document.createElement('textarea');
  field.value = text;
  document.body.appendChild(field);
  field.select();
  try {
    document.execCommand('copy');
  } catch {
    // Blocked here too: the address is on screen and selectable anyway.
  }
  field.remove();
};

export type ContactMouthProps = {
  email?: string;
  defaultOpen?: boolean;
  className?: string;
};

export const ContactMouth = ({
  email = EMAIL,
  defaultOpen = false,
  className,
}: ContactMouthProps) => {
  const { open, toggle } = usePopover(defaultOpen);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    await copyText(email);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  }, [email]);

  return (
    <div
      className={cn('relative select-none', className)}
      style={{ width: MOUTH_WIDTH, height: MOUTH_HEIGHT }}
    >
      {open ? (
        <div
          className="absolute right-[58px] bottom-[2px] z-[9] box-border animate-slide-in-card rounded-[16px_16px_6px_16px] bg-surface-2 p-[15px] shadow-[var(--shadow-panel)] [border:var(--border-cta-soft)]"
          style={{ ...PANEL_ENTER, width: PANEL_WIDTH }}
        >
          <span className="absolute right-[-11px] bottom-[8px] h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-accent-30" />
          <span className="absolute right-[-9px] bottom-[9px] h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-surface-2" />

          <p
            className="mb-[9px] text-fg-4 uppercase"
            style={{
              fontSize: 'var(--type-readout-size)',
              letterSpacing: '.26em',
            }}
          >
            lorem ipsum
          </p>
          <p
            className="mb-[13px] text-fg-2"
            style={{
              fontWeight: 'var(--weight-regular)',
              fontSize: 'var(--type-detail-size)',
              lineHeight: 'var(--type-detail-line)',
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore.
          </p>
          <div className="flex items-center gap-[8px]">
            <a
              className="flex-1 rounded-full border border-accent bg-accent-12 px-[12px] py-[9px] text-center text-fg-2 no-underline transition-[background-color] duration-[140ms] ease-out hover:bg-accent-20 motion-reduce:transition-none"
              href={MAILTO}
              style={{
                fontSize: 'var(--type-label-size)',
                letterSpacing: '.06em',
              }}
            >
              {email}
            </a>
            <button
              className="box-border flex-none cursor-pointer rounded-full border border-[var(--border-neutral-color)] py-[9px] text-center whitespace-nowrap text-fg-3 transition-[color] duration-[140ms] ease-out hover:text-fg-2 motion-reduce:transition-none"
              onClick={() => {
                void copy();
              }}
              style={{
                width: COPY_WIDTH,
                fontSize: 'var(--type-label-size)',
                letterSpacing: '.06em',
              }}
              type="button"
            >
              {copied ? 'copied' : 'copy'}
            </button>
          </div>
        </div>
      ) : null}

      <button
        aria-expanded={open}
        aria-label="Contact"
        className="absolute top-[5px] left-0 block h-[24px] w-[34px] cursor-pointer overflow-hidden transition-transform duration-[180ms] ease-[cubic-bezier(.165,.84,.44,1)] hover:scale-[1.08] active:scale-[1.02] motion-reduce:transition-none"
        data-open={open}
        onClick={toggle}
        style={{
          borderRadius: '17px/12px',
          background: LIPS_FILL,
          boxShadow:
            'inset -2px -3px 7px rgba(0,0,0,.45), inset 2px 3px 6px rgba(255,255,255,.3), var(--eye-shadow)',
        }}
        type="button"
      >
        <span
          className="absolute right-[3px] left-[3px] rounded-[50%] transition-[top,height] duration-[180ms] ease-out motion-reduce:transition-none"
          style={{
            top: open ? 6 : 10.5,
            height: open ? 12 : 3,
            background: APERTURE_FILL,
            boxShadow: 'inset 0 3px 5px rgba(0,0,0,.85)',
          }}
        >
          {open ? (
            <>
              <span className="absolute top-0 right-[4px] left-[4px] h-[3px] rounded-[0_0_6px_6px] bg-[rgba(255,255,255,.86)]" />
              <span className="absolute right-[7px] bottom-0 left-[7px] h-[2px] rounded-[6px_6px_0_0] bg-[rgba(255,255,255,.5)]" />
            </>
          ) : null}
        </span>
        <span className="absolute top-[3px] left-[7px] h-[4px] w-[9px] rounded-full bg-[rgba(255,255,255,.55)] blur-[1.1px]" />
        <span className="absolute right-[6px] bottom-[3px] h-[3px] w-[6px] rounded-full bg-[rgba(255,255,255,.3)] blur-[1px]" />
      </button>
    </div>
  );
};

export default ContactMouth;
