import React from 'react';
import styled from '@emotion/styled';
import { Text } from 'components';

const StyledListing = styled.div`
  background: ${p => p.theme.get('lightGray')};
  height: ${p => p.theme.get('listingHeight')};
  width: 100%;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  margin-bottom: ${p => p.theme.size(4)};
  cursor: pointer;
`;

export default function Listing() {
  return (
    <StyledListing>
      <Text>test</Text>
    </StyledListing>
  );
}
