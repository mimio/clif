import React, { useRef, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { animated, useSpring } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import isTouchDevice from 'is-touch-device';
import { getBool, getStyle } from 'styles/utils';
import { mobile, tablet, mq } from 'styles/breakpoints';
import { Row } from './layout';

const Container = styled(animated.div)`
  position: relative;
  width: 100%;
  overflow-y: visible;
  ${getBool(
    '',
    `
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  `,
    `
    overflow-x: scroll;
  `,
  )};
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

const Child = styled.div`
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

const Inner = styled(Row)`
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

export default function Filmstrip({ className = '', children }) {
  const outerRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  // const [isTouching, setIsTouching] = useState(false);

  useEffect(() => {
    setIsTouch(isTouchDevice());
    const listener = window.addEventListener('resize', () =>
      setIsTouch(isTouchDevice()),
    );
    // const touchStartListener = outerRef.current.addEventListener(
    //   'touchstart',
    //   () => setIsTouching(true),
    // );
    // const touchEndListener = outerRef.current.addEventListener(
    //   'touchend',
    //   () => setIsTouching(false),
    // );
    return () => {
      window.removeEventListener('resize', listener);
      // outerRef.current.removeEventListener(
      //   'touchstart',
      //   touchStartListener,
      // );
      // outerRef.current.removeEventListener(
      //   'touchend',
      //   touchEndListener,
      // );
    };
  }, []);

  const getRange = () =>
    outerRef.current.scrollWidth - outerRef.current.clientWidth;

  const [{ scroll }, setSpring] = useSpring(() => ({
    scroll: 0,
  }));

  const bindDrag = useDrag((drag) => {
    if (isTouch) return;
    const {
      movement: [mx],
      velocity,
      dragging,
    } = drag;

    const min = 0;
    const max = getRange();

    const projected =
      outerRef.current.scrollLeft - mx * (1 + velocity);
    let normalized = projected;

    if (projected <= min) normalized = min;
    if (projected >= max) normalized = max + 50;

    setIsDragging(dragging && mx !== 0);

    setSpring({ scroll: normalized });
  });

  // const bindScroll = useScroll(({ scrolling }) => {
  //   if (isTouch) setIsDragging(isTouching && scrolling);
  // });

  return (
    <Container
      className={className}
      isTouch={isTouch}
      ref={outerRef}
      scrollLeft={scroll}
      {...bindDrag()}
      // {...bindScroll()}
    >
      <Inner isDragging={isDragging}>
        {children.map((child, i) => (
          <Child key={child?.props?.id} index={i}>
            {child}
          </Child>
        ))}
      </Inner>
    </Container>
  );
}

Filmstrip.propTypes = {
  className: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};
