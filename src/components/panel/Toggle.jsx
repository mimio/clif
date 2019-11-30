import React from 'react';
import styled from '@emotion/styled';
import { getStyle, mq } from 'styles';
import { Centered } from 'components/layout';

import { ReactComponent as ChevronDown } from './chevronDown.svg';

const ToggleContainer = styled(Centered)`
  ${mq({
    display: ['flex', 'none'],
  })}
  height: 50px;
  width: 50px;
  cursor: pointer;
  z-index: 10;
  position: absolute;
  border-radius: 100%;
  transform: ${({ showing }) =>
    `translateY(${showing ? '-60%' : 'calc(50vh - 55px)'})`};
  background: ${getStyle('limeGreen')};
  background-image: radial-gradient(
    circle at 20% -20%,
    #e3ff3a,
    ${getStyle('limeGreen')}
  );

  transition: transform 0.33s ease-in-out;
  transition-delay: 0.05s;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 1);
  > svg {
    height: 28px;
    width: 28px;
    transform: ${({ showing }) => `rotate(${showing ? 0 : 180}deg)`};
    transition: transform 0.3s ease;
    transform-origin: center;
  }
`;

export default function Toggle({ onClick, showing }) {
  return (
    <ToggleContainer showing={showing} onClick={onClick}>
      <ChevronDown />
    </ToggleContainer>
  );
}
