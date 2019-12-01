import React from 'react';
import styled from '@emotion/styled';
import { getStyle } from 'styles';
import { ReactComponent as Chevron } from '../panel/chevronDown.svg';

const NextPrevContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  user-select: none;
  > svg {
    cursor: pointer;
    height: 30px;
    width: 30px;
    fill: ${getStyle('limeGreen')};
  }
`;

const PrevArrow = styled(Chevron)`
  transform: rotate(90deg);
`;

const NextArrow = styled(Chevron)`
  transform: rotate(-90deg);
`;

export default function NextPrevSelector({ onPrev, onNext }) {
  return (
    <NextPrevContainer>
      <PrevArrow onClick={onPrev} />
      <NextArrow onClick={onNext} />
    </NextPrevContainer>
  );
}
