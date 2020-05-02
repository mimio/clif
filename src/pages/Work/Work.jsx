import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import Page from 'components/Page';
import { getStyle, tablet } from 'styles';
import Popup from './containers/Popup';
import Map from './containers/Map';
import Controls from './containers/Controls';

const DesktopControls = styled(Controls)`
  position: absolute;
  left: 0;
  bottom: ${getStyle('pageMinimumPadding')};
  left: ${getStyle('foregroundLeftPadding')};
  z-index: 6;
  ${tablet(`
    left: ${getStyle('pageMinimumPadding')};
  `)}
`;

const Work = ({ isMobile, isActive }) => (
  <Page
    Background={
      <>
        {!isMobile && <DesktopControls />}
        <Popup />
        <Map />
      </>
    }
    Subheader={isMobile ? <Controls /> : null}
    title="HISTORY"
    reveal={isActive}
  />
);

Work.propTypes = {
  isMobile: PropTypes.bool.isRequired,
};

export default Work;
