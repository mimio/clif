import React from 'react';
import styled from '@emotion/styled';
import { getStyle, mq } from 'styles';
import Listings from 'containers/Listings';
import SearchBar from 'containers/Search';
import Toggle from './Toggle';
import { Column } from '../layout';

const StyledListings = styled(Listings)`
  background: ${getStyle('transparentBlack')};
  transition: ${getStyle('hue')};
`;

const responsiveStyles = ({ theme }) =>
  mq({
    width: ['100%', theme.sizes.sidePanelWidth],
    transform: ['translateY(50%)', 'translateY(0)'],
  });

const SidePanelContainer = styled(Column)`
  position: absolute;
  left: 0;
  height: 100%;
  ${responsiveStyles}
  flex-shrink: 0;
  z-index: 10;
  transition: transform 0.3s ease-in-out;
`;

const SidePanel = ({ showing, toggleSidePanel }) => (
  <SidePanelContainer showing={showing}>
    <Toggle rotate={!showing} onClick={toggleSidePanel} />
    <SearchBar />
    <StyledListings />
  </SidePanelContainer>
);

export default SidePanel;
