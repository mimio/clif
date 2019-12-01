import React from 'react';
import styled from '@emotion/styled';
import Geolocation from 'containers/Geolocation';
import FullExtent from 'containers/FullExtent';
import Basemaps from 'containers/Basemaps';
import { MapButtonGroup } from './styles';

const TopControls = styled(MapButtonGroup)`
  position: absolute;
  top: 110px;
  right: 10px;
`;

const BottomControls = styled(MapButtonGroup)`
  position: absolute;
  top: 210px;
  right: 10px;
`;

const Controls = () => (
  <>
    <TopControls>
      <FullExtent />
      <Geolocation />
    </TopControls>
    <BottomControls>
      <Basemaps />
    </BottomControls>
  </>
);

export default Controls;
