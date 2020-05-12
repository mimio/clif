import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { selectIsMobile } from 'modules/app/selectors';
import Page from 'components/Page';
import Popup from 'pagesComponents/history/containers/Popup';
import Map from 'pagesComponents/history/containers/Map';
import Controls from 'pagesComponents/history/containers/Controls';
import { getStyle, tablet } from 'styles';

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

const History = ({ isMobile }) => (
  <Page
    Background={
      <>
        {!isMobile && <DesktopControls />}
        <Popup />
        <Map reveal />
      </>
    }
    Subheader={isMobile ? <Controls /> : null}
    title="HISTORY"
    reveal
  />
);

History.propTypes = {
  isMobile: PropTypes.bool.isRequired,
};

export default connect(
  (state) => ({
    isMobile: selectIsMobile(state),
  }),
  null,
)(History);
