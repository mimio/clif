import React, { useEffect, useRef } from 'react';
import { get } from 'lodash-es';
import styled from '@emotion/styled';
import { getStyle, size } from 'styles';
import { Centered } from '../layout';

const isElementActive = element =>
  ['BUTTON', 'A'].includes(get(element, 'nodeName'));

const isTargetActive = target =>
  isElementActive(target) ||
  isElementActive(get(target, 'parentElement')) ||
  isElementActive(get(target, 'parentElement.parentElement'));

const StyledCursor = styled(Centered)`
  pointer-events: none;
  position: fixed;
  transform: translate(-50%, -50%);
  transition: ${getStyle('easeOutSize')};
  background: ${getStyle('ctaBackground1')};
  mix-blend-mode: exclusion;
  z-index: 10000;
  border-radius: 50%;
`;

const Cursor = () => {
  const cursorEl = useRef(null);
  useEffect(() => {
    const style = get(cursorEl, 'current.style', {});
    const onMouseMove = ({ clientX, clientY, target }) => {
      const active = isTargetActive(target);
      const diameter = active ? 10 : 7;
      style.top = `${clientY}px`;
      style.left = `${clientX}px`;
      style.height = size(diameter);
      style.width = size(diameter);
    };
    const onMouseLeave = () => {
      style.height = 0;
      style.width = 0;
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return <StyledCursor ref={cursorEl} isOnScreen />;
};

export default Cursor;
