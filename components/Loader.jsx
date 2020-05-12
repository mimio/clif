import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { getBool, getStyle } from 'styles/utils';
import { Column } from './layout';
import { Detail2 } from './text';

const Bar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  transform: translateX(-100%);
  border-radius: 4px;
  background: ${getStyle('ctaBackground1')};
`;

const Progress = styled.div`
  width: 100%;
  max-width: 180px;
  height: 8px;
  border: ${getStyle('ctaBorder2')};
  border-radius: 6px;
  background: none;
  position: relative;
  overflow: hidden;
`;

const Container = styled(Column)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 10000;
  justify-content: center;
  background: ${getStyle('background1')};
  transition: opacity 0.4s ease-in-out;
  ${getBool(
    'isDone',
    `
    opacity: 0;
    pointer-events: none;
    transition-delay: 0.3s;
    > * {
      transition: transform 0.15s ease-in-out, ${getStyle(
        'linearHue',
      )};
      transform: translateY(-8px);
      opacity: 0;
      transition-delay: 0.15s;
    }
  `,
  )}
`;

let progress = 0;
const Loader = () => {
  const [isDone, setDone] = useState(false);
  const barEl = useRef(null);

  useEffect(() => {
    let request;
    const moveLoader = () => {
      progress = Math.min(
        (progress += 0.5 + (progress * 2) / 100),
        100,
      );
      barEl.current.style.transform = `translateX(-${
        100 - progress
      }%)`;
      if (progress === 100) {
        setDone(true);
        cancelAnimationFrame(request);
      }
      if (progress < 100) {
        request = requestAnimationFrame(moveLoader);
      }
    };
    request = requestAnimationFrame(moveLoader);
    return () => {
      if (request) cancelAnimationFrame(request);
    };
  }, []);

  return (
    <Container isDone={isDone} sp={6}>
      <Detail2>
        {isDone ? 'Stuff loaded!' : 'Loading stuff...'}
      </Detail2>
      <Progress>
        <Bar ref={barEl} />
      </Progress>
    </Container>
  );
};

export default Loader;
