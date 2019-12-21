import React from 'react';
import styled from '@emotion/styled';
import { getStyle, size } from 'styles';
import { Column } from 'components';
import Information from './containers/Information';

const AppContainer = styled(Column)`
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: ${getStyle('background1')};
  padding: ${size(50)} ${size(30)} ${size(20)};
`;

export default () => (
  <AppContainer>
    <Information />
  </AppContainer>
);
