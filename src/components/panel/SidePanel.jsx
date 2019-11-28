import React from 'react';
import styled from '@emotion/styled';
import { getStyle, mq } from 'styles';
import Listings from 'containers/Listings';
import Detail from 'containers/Detail';
import SearchBar from 'containers/Search';
import Toggle from './Toggle';

const StyledListings = styled(Listings)`
  transition: ${getStyle('hue')};
`;

const StyledDetail = styled(Detail)`
  position: absolute;
  top: 0;
  left: 0;
  transition: ${getStyle('hue')};
`;

const SHOW_DETAILS = 'showDetails';
const SHOW_LISTINGS = 'showListings';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: ${getStyle('sidePanelWidth')};
  height: 100%;
  background: ${getStyle('transparentBlack')};
  z-index: 10;
  transition: transform 0.3s ease-in-out;
  &.${SHOW_DETAILS} {
    ${StyledListings} {
      opacity: 0;
      pointer-events: none;
    }
  }
  &.${SHOW_LISTINGS} {
    ${StyledDetail} {
      opacity: 0;
      pointer-events: none;
    }
  }
`;

const SidePanel = ({ showDetailView, showing, toggleSidePanel }) => (
  <Container
    css={mq({
      top: ['50%', '50%', '50%', 0],
      height: ['unset', 'unset', 'unset', '100%'],
      width: ['100%', '100%', '100%', '470px'],
    })}
    className={showDetailView ? SHOW_DETAILS : SHOW_LISTINGS}
    showing={showing}
    showDetail={showDetailView}
  >
    <Toggle onClick={toggleSidePanel} />
    <SearchBar />
    <StyledListings />
    <StyledDetail />
  </Container>
);

export default SidePanel;
