import React from 'react';
import styled from '@emotion/styled';
import { getStyle } from 'styles';
import { ReactComponent as Chevron } from '../panel/chevronDown.svg';

const NextPrevContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  user-select: none;
`;

const ChevronBase = styled(Chevron)`
  cursor: pointer;
  height: 30px;
  width: 30px;
  fill: ${getStyle('darkLimeGreen')};
  transition: ${getStyle('hue')};
  &:hover {
    fill: ${getStyle('limeGreen')};
  }
`;

const PrevArrow = styled(ChevronBase)`
  transform: rotate(90deg);
  margin-right: 16px;
`;

const NextArrow = styled(ChevronBase)`
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
