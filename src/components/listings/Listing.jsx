import React from 'react';
import styled from '@emotion/styled';

const StyledListing = styled.div`
  background: ${p => p.theme.get('lightGray')};
  height: ${p => p.theme.get('listingHeight')};
  width: 100%;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  color: ${p => p.theme.get('limeGreen')};
  margin-bottom: ${p => p.theme.size(4)};
  user-select: none;
  cursor: pointer;
  -webkit-overflow-scrolling: touch;
  &:active {
    background: ${p => p.theme.get('limeGreen')};
    color: ${p => p.theme.get('gray')};
  }
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  line-height: 1.5;
`;

const StyledName = styled.span`
  font-family: Antonio;
  font-weight: 700;
  font-size: 20px;
`;

const StyledDescription = styled.span`
  font-size: 16px;
`;

const Icon = styled.div`
  width: 64px;
`;

export default function Listing({ item: { Name } }) {
  return (
    <StyledListing>
      <Icon />
      <NameContainer>
        <StyledName>{Name}</StyledName>
        <StyledDescription>2.3M| +/- 1000ft</StyledDescription>
      </NameContainer>
    </StyledListing>
  );
}
