import React from 'react';
import styled from '@emotion/styled';
import Listings from 'containers/Listings';
import Detail from 'containers/Detail';
import SearchBar from 'containers/Search';
import Toggle from './Toggle';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: ${({ theme }) => theme.get('sidePanelWidth')};
  height: 100%;
  background: ${({ theme }) => theme.get('gray')};
  transform: ${p => (p.showing ? '' : `translateX(-100%)`)};
  z-index: 10;
  transition: transform 0.3s ease-in-out;
`;

export default function SidePanel({
  showing,
  toggleSidePanel,
  showDetailView,
}) {
  return (
    <Container showing={showing}>
      <Toggle onClick={toggleSidePanel} />
      <SearchBar />
      {showDetailView ? <Detail /> : <Listings />}
    </Container>
  );
}
