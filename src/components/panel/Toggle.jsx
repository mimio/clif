import React from 'react';
import styled from '@emotion/styled';

const ToggleContainer = styled.div`
  height: 50px;
  width: 50px;
  background: red;
  cursor: pointer;
  position: absolute;
  z-index: 10;
  top: -50px;
`;

export default function Toggle({ onClick }) {
  return <ToggleContainer onClick={onClick} />;
}
