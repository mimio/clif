import React, { useRef, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { animated, useSpring } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import { isTouchScreen } from 'utils/device';
import {
  getBool,
  foregroundContentVerticalPadding,
  tablet,
  getStyle,
  mq,
} from 'styles';
import { Row } from './layout';

const Container = styled(animated.div)`
  position: relative;
  width: 100%;
  overflow-y: visible;
  overflow-x: ${({ isTouch }) => (isTouch ? 'auto' : 'hidden')};
  ${foregroundContentVerticalPadding};
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
  margin-left: 48px;
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
  ${tablet(`
    > *:first-child {
      margin-left: ${getStyle('foregroundLeftPaddingTablet')};
    }
    > * {
      margin-left: 12px;
    }
    > *:nth-child(odd) {
      margin-bottom: 12px;
    }
    > *:nth-child(even) {
      margin-top: 12px;
    }
  `)};
`;

export default function Filmstrip({ className, children }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(isTouchScreen());
    const listener = window.addEventListener('resize', () =>
      setIsTouch(isTouchScreen()),
    );
    return () => {
      window.removeEventListener('resize', listener);
    };
  }, []);

  const outerRef = useRef(null);
  const getRange = () =>
    outerRef.current.scrollWidth - outerRef.current.clientWidth;

  const [{ scroll }, setSpring] = useSpring(() => ({
    scroll: 0,
  }));

  const bind = useDrag(drag => {
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

    if (!isTouch) setSpring({ scroll: normalized });
  });

  return (
    <Container
      className={className}
      isTouch={isTouch}
      ref={outerRef}
      scrollLeft={scroll}
      {...bind()}
    >
      <Inner isDragging={isDragging}>
        {children.map(child => (
          <Child>{child}</Child>
        ))}
      </Inner>
    </Container>
  );
}

Filmstrip.propTypes = {
  className: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

Filmstrip.defaultProps = {
  className: '',
};
