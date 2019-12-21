import React from 'react';
import styled from '@emotion/styled';
import { getStyle } from 'styles';

const AppContainer = styled.main`
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: ${getStyle('background1')};
`;

export default () => <AppContainer>banana</AppContainer>;
