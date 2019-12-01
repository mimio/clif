import React from 'react';
import styled from '@emotion/styled';

const StyledResetButton = styled.button`
  height: 40px;
  width: 40px;
  border-radius: 100%;
  background: white;
  cursor: pointer;
  position: absolute;
  left: 10px;
  top: 10px;
  outline: 0;
  border: none;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.5);
  z-index: 10;
`;

export default function ResetButton({ onClick }) {
  return <StyledResetButton onClick={onClick} />;
}
