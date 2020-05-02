import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { getBool, getStyle } from 'styles';
import { Column, Detail2 } from 'components';

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
  transition: ${getStyle('linearHue')};
  ${getBool(
    'isDone',
    `
    opacity: 0;
    pointer-events: none;
    transition-delay: 0.3s;
  `,
  )}
`;

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

const Indicator = styled.div`
  width: 100%;
  max-width: 180px;
  height: 8px;
  border: ${getStyle('ctaBorder2')};
  border-radius: 6px;
  background: none;
  position: relative;
  overflow: hidden;
`;

let progress = 0;
const Loader = () => {
  const [isDone, setDone] = useState(false);
  const barEl = useRef(null);

  useEffect(() => {
    const moveLoader = () => {
      progress = Math.min(
        (progress += 0.5 + (progress * 2) / 100),
        100,
      );
      barEl.current.style.transform = `translateX(-${
        100 - progress
      }%)`;
      if (progress === 100) setDone(true);
      if (progress < 100) requestAnimationFrame(moveLoader);
    };
    requestAnimationFrame(moveLoader);
  }, []);

  return (
    <Container isDone={isDone} sp={6}>
      <Detail2>
        {isDone ? 'Stuff loaded!' : 'Loading stuff...'}
      </Detail2>
      <Indicator>
        <Bar ref={barEl} />
      </Indicator>
    </Container>
  );
};

export default Loader;
