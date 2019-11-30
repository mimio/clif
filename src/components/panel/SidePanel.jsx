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
  });

const SidePanelContainer = styled(Column)`
  position: absolute;
  left: 0;
  height: 100%;
  transform: ${({ showing }) =>
    `translateY(${showing ? '50%' : '100%'})`};
  ${responsiveStyles}
  flex-shrink: 0;
  z-index: 10;
  transition: transform 0.3s ease-in-out;
`;

const SidePanel = ({ showing, toggleSidePanel, isLoading }) =>
  isLoading ? null : (
    <>
      <Toggle showing={showing} onClick={toggleSidePanel} />
      <SidePanelContainer showing={showing}>
        <SearchBar />
        <StyledListings />
      </SidePanelContainer>
    </>
  );

export default SidePanel;
