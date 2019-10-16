import React from 'react';
import styled from '@emotion/styled';

const StyledToggle = styled.div`
  height: 25px;
  width: 25px;
  border-radius: 25px;
  top: 25px;
  right: -25px;
  cursor: pointer;
  z-index: 10;
  background: red;
  position: absolute;
`;

export default function Toggle({ onClick }) {
  return <StyledToggle onClick={onClick} />;
}
