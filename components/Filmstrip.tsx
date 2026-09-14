import {
  useRef,
  useState,
  useSyncExternalStore,
  type ReactElement,
} from 'react';
import styled from '@emotion/styled';
import { animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import isTouchDevice from 'is-touch-device';
import { getBool, getStyle } from 'styles/utils';
import { mobile, tablet, mq } from 'styles/breakpoints';
import { Row } from './layout';

// animated.div is a component, so Emotion forwards every prop to it; keep
// the styling flag off the DOM.
const Container = styled(animated.div, {
  shouldForwardProp: (prop) => prop !== 'isTouch',
})<{ isTouch: boolean }>`
  position: relative;
  width: 100%;
  overflow-y: visible;
  overflow-x: ${({ isTouch }) => (isTouch ? 'auto' : 'hidden')};
  -webkit-overflow-scrolling: touch;
  ::-webkit-scrollbar {
    height: 0;
    width: 0;
  }

  ::-webkit-scrollbar-track,
  ::-webkit-scrollbar-thumb {
    border: 0px solid rgba(255, 255, 255, 0);
    border-radius: 0px;
  }
`;

const Child = styled.div<{ index: number }>`
  height: 100%;
  > * {
    @keyframes slidein {
      from {
        opacity: 0;
        transform: translateY(-16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    animation: 0.3s ease-in forwards slidein;
    ${({ index }) => `
      animation-delay: ${index * 80}ms;
    `};
    opacity: 0;
  }
`;

const Inner = styled(Row)<{ isDragging: boolean }>`
  height: 100%;
  width: min-content;
  cursor: ew-resize;
  ${Child} {
    pointer-events: ${({ isDragging }) =>
      isDragging ? 'none' : 'auto'};
    transition: transform ease-in-out 0.24s !important;
    ${getBool(
      'isDragging',
      `
        transform: scale(0.96);
      `,
      `
        &:hover {
          transform: scale(1.02);
        }
        &:active {
          transform: scale(1.01);
        }
      `,
    )};
  }
  > *:nth-child(odd) {
    margin-bottom: 24px;
  }
  > *:nth-child(even) {
    margin-top: 24px;
  }
  > *:last-child {
    ${mq({
      marginRight: [
        getStyle('foregroundContentRightPadding'),
        getStyle('foregroundContentRightPaddingTablet'),
        getStyle('foregroundContentRightPaddingMobile'),
      ],
    })};
  }
  > *:first-child {
    margin-left: ${getStyle('foregroundLeftPadding')};
  }
  > * {
    margin-left: 48px;
  }
  ${tablet(`
    > *:first-child {
      margin-left: ${getStyle('foregroundLeftPaddingTablet')};
    }
    > * {
      margin-left: 24px;
    }
    > *:nth-child(odd) {
      margin-bottom: 12px;
    }
    > *:nth-child(even) {
      margin-top: 12px;
    }
  `)};
  ${mobile(`
      > * {
    margin-left: 12px;
  }
  `)};
`;

// Touch capability is read from the browser on the client and re-checked on
// resize; the server snapshot is `false` so hydration matches the SSR markup.
const subscribeToResize = (onChange: () => void) => {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};
const getIsTouch = () => isTouchDevice();
const getServerIsTouch = () => false;

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

  const bindDrag = useDrag((drag) => {
    if (isTouch) return;
    const {
      movement: [mx],
      velocity: [vx],
      dragging,
    } = drag;

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
    <Container
      className={className}
      isTouch={isTouch}
      ref={outerRef}
      scrollLeft={scroll}
      {...bindDrag()}
    >
      <Inner isDragging={isDragging}>
        {children.map((child, i) => (
          <Child key={child.props.id ?? i} index={i}>
            {child}
          </Child>
        ))}
      </Inner>
    </Container>
  );
}
