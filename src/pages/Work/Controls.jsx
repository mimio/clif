import React from 'react';
import PropTypes from 'prop-types';
// import styled from '@emotion/styled';
import { Button } from 'components';
import { ExpandIcon } from 'icons';

const Controls = ({ fitBounds }) => (
  <Button onClick={fitBounds} Icon={ExpandIcon}>
    RESET
  </Button>
);

Controls.propTypes = {
  fitBounds: PropTypes.func.isRequired,
};

export default Controls;
