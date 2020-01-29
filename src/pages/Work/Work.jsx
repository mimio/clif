import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import Page from 'components/Page';
import { getStyle } from 'styles';
import Popup from './containers/Popup';
import Map from './containers/Map';
import Controls from './containers/Controls';

const DesktopControls = styled(Controls)`
  position: absolute;
  left: 0;
  bottom: ${getStyle('pageMinimumPadding')};
  left: ${getStyle('foregroundLeftPadding')};
  z-index: 6;
`;

const Work = ({ isMobile }) => (
  <Page
    Background={
      <>
        {!isMobile && <DesktopControls />}
        <Popup />
        <Map />
      </>
    }
    Subheader={isMobile ? <Controls /> : null}
  />
);

Work.propTypes = {
  isMobile: PropTypes.bool.isRequired,
};

export default Work;
