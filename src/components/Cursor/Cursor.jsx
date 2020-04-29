import React, { useEffect, useRef } from 'react';
import { get } from 'lodash-es';
import styled from '@emotion/styled';
import { getStyle, size } from 'styles';
import { isTouchScreen } from 'utils/device';

const isElementActive = (element) =>
  ['BUTTON', 'A'].includes(get(element, 'nodeName'));

const isTargetActive = (target) =>
  isElementActive(target) ||
  isElementActive(get(target, 'parentElement')) ||
  isElementActive(get(target, 'parentElement.parentElement')) ||
  isElementActive(
    get(target, 'parentElement.parentElement.parentElement'),
  );

const StyledCursor = styled.div`
  pointer-events: none;
  position: fixed;
  transform: translate(-50%, -50%);
  transition: ${getStyle('easeOutSize')}, ${getStyle('linearHue')};
  background: ${getStyle('ctaBackground1')};
  border: 1px solid ${getStyle('ctaBackground4')};
  mix-blend-mode: exclusion;
  z-index: 10000;
  border-radius: 50%;
`;

let isTouch = false;
const Cursor = () => {
  const cursorEl = useRef(null);
  useEffect(() => {
    isTouch = isTouchScreen();
    if (isTouchScreen()) return () => {};
    const style = get(cursorEl, 'current.style', {});
    const onMouseMove = ({ clientX, clientY, target }) => {
      const active = isTargetActive(target);
      const diameter = active ? 10 : 4;
      style.top = `${clientY}px`;
      style.left = `${clientX}px`;
      style.height = size(diameter);
      style.width = size(diameter);
      style.background = active
        ? 'transparent'
        : getStyle('ctaBackground1');
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
