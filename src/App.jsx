import React from 'react';
import styled from '@emotion/styled';
import Map from 'components/map/Map';
import SidePanel from './containers/SidePanel';

const Container = styled.main`
  display: flex;
  height: 100%;
  width: 100%;
  color: white;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial,
    sans-serif;
`;

export default () => (
  <Container>
    <SidePanel />
    <Map />
  </Container>
);
