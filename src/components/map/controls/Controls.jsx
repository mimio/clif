import React from 'react';
import styled from '@emotion/styled';
import Geolocation from 'containers/Geolocation';
import FullExtent from 'containers/FullExtent';
import { MapButtonGroup } from './styles';

const StyledMapButtonGroup = styled(MapButtonGroup)`
  position: absolute;
  top: 110px;
  right: 10px;
`;

const Controls = () => (
  <StyledMapButtonGroup>
    <FullExtent />
    <Geolocation />
  </StyledMapButtonGroup>
);

export default Controls;
