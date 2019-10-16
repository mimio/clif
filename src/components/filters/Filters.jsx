import React from 'react';
import styled from '@emotion/styled';
import Filter from './Filter';

const StyledFilters = styled.div`
  height: ${p => p.theme.get('filterBarHeight')};
  width: 100%;
  position: relative;
  display: flex;
  flex-wrap: wrap;
`;

export default function Filters() {
  return (
    <StyledFilters>
      <Filter />
      <Filter />
      <Filter />
      <Filter />
      <Filter />
      <Filter />
    </StyledFilters>
  );
}
