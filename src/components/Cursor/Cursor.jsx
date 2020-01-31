import React, { useEffect, useRef } from 'react';
import { get } from 'lodash-es';
import styled from '@emotion/styled';
import { getStyle, size } from 'styles';

const isElementActive = element =>
  ['BUTTON', 'A'].includes(get(element, 'nodeName'));

const isTargetActive = target =>
  isElementActive(target) ||
  isElementActive(get(target, 'parentElement')) ||
  isElementActive(get(target, 'parentElement.parentElement'));

const isTouchScreen = () => {
  const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  const mq = query => window.matchMedia(query).matches;
  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
      return true;
  }
  const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
};

const StyledCursor = styled.div`
  pointer-events: none;
  position: fixed;
  transform: translate(-50%, -50%);
  transition: ${getStyle('easeOutSize')};
  background: ${getStyle('ctaBackground1')};
  mix-blend-mode: exclusion;
  z-index: 10000;
  border-radius: 50%;
`;

let isTouch = false;
const Cursor = () => {
  const cursorEl = useRef(null);
  useEffect(() => {
    isTouch = isTouchScreen();
    if (isTouch) return () => {};
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
    const onMouseDown = () => {
      style.height = `calc(${style.height} - 4px)`;
      style.width = `calc(${style.width} - 4px)`;
    };
    const onMouseUp = () => {
      style.height = `calc(${style.height} + 4px)`;
      style.width = `calc(${style.width} + 4px)`;
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);
  if (isTouch) return null;

  return <StyledCursor ref={cursorEl} isOnScreen />;
};

export default Cursor;
