import React, { useEffect, useRef } from 'react';
import { get } from 'lodash-es';
import styled from '@emotion/styled';
import { getStyle } from 'styles';
import isTouchDevice from 'is-touch-device';

let lastElement;
let lastPayload;
const getElementMetadata = (element, depth = 8) => {
  const payload = {
    hasXOverflow: false,
    hasYOverflow: false,
    isActive: false,
    isButton: false,
    isLink: false,
    isExternalLink: false,
  };
  if (!element || element.isEqualNode(lastElement)) {
    return lastPayload || payload;
  }
  let _element = element;
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
  lastElement = element;
  lastPayload = payload;
  return payload;
};

const DIAMETER = 16;
const RADIUS = DIAMETER / 2;

const CursorSymbol = styled.div`
  height: 240%;
  width: 240%;
  transform: translate(-25%, -25%) scale(0.5);
  transition: ${getStyle('easeOutSize')}, ${getStyle('linearHue')};
  background: ${getStyle('ctaBackground1')};
  border: 1px solid ${getStyle('ctaBackground4')};
  border-radius: 50%;
  ::after {
    content: '';
    position: absolute;
    top: -6px;
    right: -6px;
    width: 0;
    height: 0;
    transform: rotate(45deg);
    opacity: 0;
    transition: ${getStyle('easeOutSize')}, ${getStyle('linearHue')};
    border-left: 0px solid transparent;
    border-right: 0px solid transparent;
    border-bottom: 0px solid ${getStyle('ctaBackground4')};
  }
`;

const CursorShell = styled.div`
  pointer-events: none;
  position: fixed;
  height: ${DIAMETER}px;
  width: ${DIAMETER}px;
  mix-blend-mode: exclusion;
  z-index: 10000;
  &.offScreen ${CursorSymbol} {
    transform: translate(-25%, -25%) scale(0);
  }
  &.pressed ${CursorSymbol} {
    transform: translate(-25%, -25%) scale(0.4);
  }
  &.overActiveEl ${CursorSymbol} {
    transform: translate(-25%, -25%) scale(1);
    background: transparent;
  }
  &.overActiveEl.pressed ${CursorSymbol} {
    transform: translate(-25%, -25%) scale(0.8);
  }
  &.overLink ${CursorSymbol} ::after {
    opacity: 1;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid ${getStyle('ctaBackground1')};
  }
`;

let _clientX = -100;
let _clientY = -100;
const Cursor = () => {
  const cursorEl = useRef(null);
  useEffect(() => {
    if (isTouchDevice()) return () => {};
    const processMouseTarget = (target) => {
      const { isExternalLink, isActive } = getElementMetadata(target);
      cursorEl.current.classList.remove('offScreen');
      cursorEl.current.classList.toggle('overLink', isExternalLink);
      cursorEl.current.classList.toggle('overActiveEl', isActive);
    };
    const onMouseMove = ({ clientX, clientY, target }) => {
      _clientX = clientX;
      _clientY = clientY;
      processMouseTarget(target);
    };
    const onMouseLeave = () => {
      cursorEl.current.classList.add('offScreen');
    };
    const onMouseDown = () => {
      cursorEl.current.classList.add('pressed');
    };
    const onMouseUp = ({ clientX, clientY }) => {
      cursorEl.current.classList.remove('pressed');
      setTimeout(() => {
        processMouseTarget(
          document.elementFromPoint(clientX, clientY),
        );
      }, 5);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    const style = get(cursorEl, 'current.style', {});

    const renderCursorStyles = () => {
      style.transform = `translate(${_clientX - RADIUS}px, ${
        _clientY - RADIUS
      }px)`;
      requestAnimationFrame(renderCursorStyles);
    };

    requestAnimationFrame(renderCursorStyles);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);
  if (isTouchDevice()) return null;

  return (
    <CursorShell ref={cursorEl}>
      <CursorSymbol />
    </CursorShell>
  );
};

export default Cursor;
