import React from 'react';
import { getProp } from 'styles';
import styled from '@emotion/styled';

const colors = [
  'limeGreen',
  'pink',
  'oceanGreen',
  'darkGreen',
  'purple',
  'lightGray',
];

const StyledFilter = styled.div`
  height: 58px;
  width: 33%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: ${getProp('color')};
  margin: 0px 0px 1px 1px;
  cursor: pointer;
`;

export default function Filter({ name, index }) {
  return <StyledFilter color={colors[index]}>{name}</StyledFilter>;
}
