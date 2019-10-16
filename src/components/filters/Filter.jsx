import React from 'react';
import styled from '@emotion/styled';

const StyledFilter = styled.div`
  height: 58px;
  width: 33%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: purple;
  margin: 0px 0px 1px 1px;
`;

export default function Filter() {
  return <StyledFilter>filter</StyledFilter>;
}
