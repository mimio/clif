import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { SATELLITE_BASEMAP, TOPO_BASEMAP } from 'constants/map';
import { getBool } from 'styles';
import { MapButton } from './styles';

const StyledMapButton = styled(MapButton)`
  font-weight: ${getBool('selected', 'bold', 'normal')};
  font-size: 9px;
`;

const FullExtent = ({ selectBasemap, selectedBasemap }) => (
  <>
    <StyledMapButton
      selected={selectedBasemap === SATELLITE_BASEMAP}
      onClick={() => selectBasemap(SATELLITE_BASEMAP)}
    >
      SAT
    </StyledMapButton>
    <StyledMapButton
      selected={selectedBasemap === TOPO_BASEMAP}
      onClick={() => selectBasemap(TOPO_BASEMAP)}
    >
      TOPO
    </StyledMapButton>
  </>
);

FullExtent.propTypes = {
  selectBasemap: PropTypes.func.isRequired,
  selectedBasemap: PropTypes.string.isRequired,
};

export default FullExtent;
