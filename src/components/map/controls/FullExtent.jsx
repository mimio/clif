import React from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as FullExtentIcon } from './full-extent.svg';
import { MapButton } from './styles';

const FullExtent = ({ zoomToFullExtent }) => (
  <MapButton onClick={zoomToFullExtent}>
    <FullExtentIcon />
  </MapButton>
);

FullExtent.propTypes = {
  zoomToFullExtent: PropTypes.func.isRequired,
};

export default FullExtent;
