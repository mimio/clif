import React, { useEffect, useRef } from 'react';
import { get } from 'lodash-es';
import styled from '@emotion/styled';
import { getStyle } from 'styles';
import { isTouchScreen } from 'utils/device';

const evalElementDeep = (element, depth = 8) => {
  let _element = element;
  const payload = {
    hasXOverflow: false,
    hasYOverflow: false,
    isActive: false,
    isButton: false,
    isLink: false,
    isExternalLink: false,
  };
  for (let i = 0; i < depth; i++) {
    if (!_element) return payload;
    const nodeName = _element?.nodeName;
    if (!payload.isActive) {
      payload.isLink = nodeName === 'A';
      payload.isExternalLink =
        payload.isLink && _element?.target === '_blank';
      payload.isButton = nodeName === 'BUTTON';
      payload.isActive = payload.isLink || payload.isButton;
    }
    if (!payload.hasXOverflow) {
      payload.hasXOverflow =
        _element.scrollWidth > _element.clientWidth;
    }
    if (!payload.hasYOverflow) {
      payload.hasYOverflow =
        _element.scrollHeight > _element.clientHeight;
      payload.hasXOverflow =
        _element.scrollWidth > _element.clientWidth;
    }

    _element = get(_element, 'parentElement');
  }
  return payload;
};

const StyledCursor = styled.div`
  pointer-events: none;
  position: fixed;
  transform: translate(-50%, -50%);
  height: 16px;
  width: 16px;
  transition: ${getStyle('easeOutSize')}, ${getStyle('linearHue')};
  background: ${getStyle('ctaBackground1')};
  border: 1px solid ${getStyle('ctaBackground4')};
  mix-blend-mode: exclusion;
  z-index: 10000;
  border-radius: 50%;
  ::after {
    content: '';
    position: absolute;
    top: -6px;
    right: -6px;
    opacity: 0;
    transition: ${getStyle('easeOutSize')}, ${getStyle('linearHue')};
    width: 0;
    height: 0;
    border-left: 0px solid transparent;
    border-right: 0px solid transparent;
    border-bottom: 0px solid ${getStyle('ctaBackground4')};
    transform: rotate(45deg);
  }
  &.offScreen {
    transform: translate(-50%, -50%) scale(0);
  }
  &.pressed {
    transform: translate(-50%, -50%) scale(0.9);
  }
  &.overActiveEl {
    height: 40px;
    width: 40px;
    background: transparent;
  }
  &.overLink {
    ::after {
      opacity: 1;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 5px solid ${getStyle('ctaBackground1')};
    }
  }
`;

let isTouch = false;
const Cursor = () => {
  const cursorEl = useRef(null);
  useEffect(() => {
    isTouch = isTouchScreen();
    if (isTouchScreen()) return () => {};
    const style = get(cursorEl, 'current.style', {});
    const processCursorStyles = (target) => {
      const {
        isExternalLink,
        isActive,
        // hasXOverflow,
      } = evalElementDeep(target);
      cursorEl.current.classList.remove('offScreen');
      cursorEl.current.classList.toggle('overLink', isExternalLink);
      cursorEl.current.classList.toggle('overActiveEl', isActive);
      return evalElementDeep(target);
    };
    const onMouseMove = ({ clientX, clientY, target }) => {
      style.top = `${clientY}px`;
      style.left = `${clientX}px`;
      processCursorStyles(target);
    };
    const onMouseLeave = () => {
      cursorEl.current.classList.add('offScreen');
    };
    const onMouseDown = () => {
      cursorEl.current.classList.add('pressed');
    };
    const onMouseUp = ({ clientX, clientY }) => {
      cursorEl.current.classList.remove('pressed');
      setTimeout(
        () =>
          processCursorStyles(
            document.elementFromPoint(clientX, clientY),
          ),
        5,
      );
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
