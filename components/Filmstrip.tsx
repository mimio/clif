import {
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
} from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import isTouchDevice from 'is-touch-device';
import { cn } from 'utils/cn';

// Touch capability is read from the browser on the client and re-checked on
// resize; the server snapshot is `false` so hydration matches the SSR markup.
const subscribeToResize = (onChange: () => void) => {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};
const getIsTouch = () => isTouchDevice();
const getServerIsTouch = () => false;

// Horizontal movement, in px, from which a gesture counts as a drag
// rather than a click on the card under the pointer.
const DRAG_DISTANCE = 4;

type FilmstripProps = {
  className?: string;
  children: ReactElement<{ id?: string }>[];
};

export default function Filmstrip({
  className = '',
  children,
}: FilmstripProps) {
  const outerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const isTouch = useSyncExternalStore(
    subscribeToResize,
    getIsTouch,
    getServerIsTouch,
  );

  const getRange = () =>
    outerRef.current
      ? outerRef.current.scrollWidth - outerRef.current.clientWidth
      : 0;

  const [{ scroll }, springApi] = useSpring(() => ({
    scroll: 0,
  }));

  // A pointer that has dragged the strip must not also click the card it
  // is released over: the cards now carry -webkit-user-drag: none (the old
  // `user-drag: none` was invalid and never applied), so no native link
  // drag starts and the browser is free to fire that click. One click per
  // drag is swallowed; a keyboard activation (detail 0) never is.
  const dragged = useRef(false);
  const suppressClickAfterDrag = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (!dragged.current) return;
    dragged.current = false;
    if (event.detail === 0) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const bindDrag = useDrag((drag) => {
    if (isTouch) return;
    const {
      first,
      movement: [mx],
      velocity: [vx],
      dragging,
    } = drag;
    if (first) dragged.current = false;
    if (Math.abs(mx) >= DRAG_DISTANCE) dragged.current = true;

    const min = 0;
    const max = getRange();

    const current = outerRef.current?.scrollLeft ?? 0;
    const projected = current - mx * (1 + vx);
    let normalized = projected;

    if (projected <= min) normalized = min;
    if (projected >= max) normalized = max + 50;

    setIsDragging(Boolean(dragging) && mx !== 0);

    springApi.start({ scroll: normalized });
  });

  return (
    <animated.div
      className={cn(
        'relative scrollbar-hidden w-full overflow-y-visible',
        isTouch ? 'overflow-x-auto' : 'overflow-x-hidden',
        className,
      )}
      ref={outerRef}
      scrollLeft={scroll}
      onClickCapture={suppressClickAfterDrag}
      {...bindDrag()}
    >
      <div
        className={cn(
          'flex h-full w-min cursor-ew-resize items-center *:ml-12 *:transition-transform *:duration-[240ms] *:ease-in-out max-desktop:*:ml-6 max-tablet:*:ml-3 [&>*:first-child]:ml-28 max-desktop:[&>*:first-child]:ml-4 [&>*:last-child]:mr-30 max-desktop:[&>*:last-child]:mr-23 max-tablet:[&>*:last-child]:mr-13 [&>*:nth-child(even)]:mt-6 max-desktop:[&>*:nth-child(even)]:mt-3 [&>*:nth-child(odd)]:mb-6 max-desktop:[&>*:nth-child(odd)]:mb-3',
          isDragging
            ? '*:pointer-events-none *:scale-[0.96]'
            : '*:pointer-events-auto [&>*:active]:scale-[1.01] [&>*:hover:not(:active)]:scale-[1.02]',
        )}
      >
        {children.map((child, i) => (
          // Each child slides in a beat after the one before it.
          <div
            key={child.props.id ?? i}
            className="h-full [--slide-in-from:-16px] *:animate-slide-in-stagger *:opacity-0 *:[animation-delay:var(--stagger)]"
            style={{ '--stagger': `${i * 80}ms` } as CSSProperties}
          >
            {child}
          </div>
        ))}
      </div>
    </animated.div>
  );
}
