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

const Container = styled.div`
  top: 0;
  left: 0;
  flex-direction: column;
  flex-shrink: 0;
  width: ${getStyle('sidePanelWidth')};
  height: 50%;
  background: ${getStyle('transparentBlack')};
  z-index: 10;
  transform: ${p => `translateY(${p.showing ? '1%' : '0%'})`};
  transition: transform 0.3s ease-in-out;
  ${({ showDetailView }) =>
    showDetailView
      ? `${StyledListings} {
        opacity: 0;
        pointer-events: none;
      }`
      : `${StyledDetail} {
        opacity: 0;
        pointer-events: none;
      }`}
`;

const SidePanel = ({ showDetailView, showing, toggleSidePanel }) => (
  <Container
    css={mq({
      top: ['50%', 0],
      height: ['unset', '100%'],
      width: ['100%', '470px'],
    })}
    showing={showing}
    showDetailView={showDetailView}
  >
    <Toggle onClick={toggleSidePanel} />
    <SearchBar />
    <StyledDetail />
    <StyledListings />
  </Container>
);

export default SidePanel;
