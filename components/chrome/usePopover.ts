import { useCallback, useEffect, useRef, useState } from 'react';

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
 */
export const POPOVER_EVENT = 'oneglobe:popover';

export type Popover = {
  open: boolean;
  /** Opens this popover and closes every other one. */
  toggle: () => void;
};

export const usePopover = (defaultOpen: boolean): Popover => {
  const [open, setOpen] = useState(defaultOpen);
  // A ref as well as state: `toggle` is stable, so it cannot read `open`
  // from the closure, and the listener has to know whether it is worth a
  // re-render.
  const openRef = useRef(defaultOpen);
  const tokenRef = useRef<object>({});

  useEffect(() => {
    const onOther = (event: Event) => {
      const { detail } = event as CustomEvent<unknown>;
      if (detail === tokenRef.current) return;
      openRef.current = false;
      setOpen(false);
    };
    window.addEventListener(POPOVER_EVENT, onOther);
    return () => window.removeEventListener(POPOVER_EVENT, onOther);
  }, []);

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

  return { open, toggle };
};

export default usePopover;
