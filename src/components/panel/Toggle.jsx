import React from 'react';
import styled from '@emotion/styled';
import { ReactComponent as ChevronDown } from './chevronDown.svg';

const ToggleContainer = styled(ChevronDown)`
  height: 50px;
  width: 50px;
  cursor: pointer;
  position: absolute;
  z-index: 10;
  top: -50px;
  transform: ${p => (p.rotate ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.2s ease;
  transform-origin: center;
`;

export default function Toggle({ onClick, rotate }) {
  return <ToggleContainer rotate={rotate} onClick={onClick} />;
}
