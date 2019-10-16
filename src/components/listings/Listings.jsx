import React from 'react';
import styled from '@emotion/styled';

import Listing from './Listing';

const StyledListings = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;

  overflow: auto;
`;

const Inner = styled.div`
  margin: ${p => p.theme.size(4)};
`;

export default function Listings() {
  return (
    <StyledListings>
      <Inner>
        <Listing />
        <Listing />
        <Listing />
        <Listing />
        <Listing />
        <Listing />
        <Listing />
        <Listing />
        <Listing />
        <Listing />
        <Listing />
      </Inner>
    </StyledListings>
  );
}
