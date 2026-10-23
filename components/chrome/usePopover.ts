import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

/*
 * The chrome has two popovers -- the theme panel and the contact panel --
 * and they are mutually exclusive: opening one closes the other. They do not
 * know about each other, so the coordination runs through a window event
 * rather than through a shared parent. The design bundle already names it
 * `oneglobe:popover`, and the event's `detail` is the opener's identity, so
 * the opener can ignore its own announcement.
 *
 * Identity is a per-instance token object rather than a string id: two
 * altimeters or two eyes can be on screen at once (the specimen page has
 * several), and object identity is the only thing that stays unique.
 *
 * Escape closes whichever one is open, and so does a pointer that lands
 * anywhere else. A popover that can only be dismissed by clicking its own
 * trigger again is a trap for anyone driving the page from the keyboard,
 * and it is just as wrong for a pointer: these panels sit over a globe that
 * is there to be dragged, so the press that turns the world would otherwise
 * leave a panel hanging over it. Both listeners are only bound while
 * something is actually open, so the page has no key or pointer handler at
 * rest.
 */
export const POPOVER_EVENT = 'oneglobe:popover';

export type Popover = {
  open: boolean;
  /** Opens this popover and closes every other one. */
  toggle: () => void;
  /**
   * Goes on the element that counts as INSIDE: the wrapper that holds the
   * trigger AND the panel, never the panel on its own. The press on the
   * trigger has to read as inside, because it arrives BEFORE the click that
   * toggles -- a trigger counted as outside would close the panel on the
   * way down and the click would open it straight back up, leaving a
   * popover that cannot be shut from its own control.
   */
  ref: RefObject<HTMLDivElement | null>;
};

export const usePopover = (defaultOpen: boolean): Popover => {
  const [open, setOpen] = useState(defaultOpen);
  // A ref as well as state: `toggle` is stable, so it cannot read `open`
  // from the closure, and the listener has to know whether it is worth a
  // re-render.
  const openRef = useRef(defaultOpen);
  const tokenRef = useRef<object>({});
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    openRef.current = false;
    setOpen(false);
  }, []);

  useEffect(() => {
    const onOther = (event: Event) => {
      const { detail } = event as CustomEvent<unknown>;
      if (detail === tokenRef.current) return;
      close();
    };
    window.addEventListener(POPOVER_EVENT, onOther);
    return () => window.removeEventListener(POPOVER_EVENT, onOther);
  }, [close]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, open]);

  /*
   * Dismissal on the way DOWN rather than on click, and in the capture
   * phase. Down, because the press is the moment the visitor commits to
   * something else and a click never arrives at all when that press turns
   * into a drag of the globe; capture, because a handler between the window
   * and the target cannot then swallow the dismissal on the way up.
   *
   * The root is read at event time and is never null while this is bound:
   * the listener only exists while the popover is open, and an open popover
   * has rendered the wrapper the ref sits on.
   */
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event: Event): void => {
      const root = ref.current as HTMLDivElement;
      if (root.contains(event.target as Node | null)) return;
      close();
    };
    window.addEventListener('pointerdown', onDown, true);
    return () =>
      window.removeEventListener('pointerdown', onDown, true);
  }, [close, open]);

  const toggle = useCallback(() => {
    const next = !openRef.current;
    openRef.current = next;
    setOpen(next);
    if (next) {
      window.dispatchEvent(
        new CustomEvent(POPOVER_EVENT, {
          detail: tokenRef.current,
        }),
      );
    }
  }, []);

  return { open, toggle, ref };
};

export default usePopover;
