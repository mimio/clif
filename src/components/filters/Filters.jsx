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
  // todo: these are fake as fuck
  return (
    <StyledFilters>
      {[
        'SNOWMOBILING',
        'RAFTING',
        'ATV',
        'HORSES',
        'FISHING',
        'CLEAR',
      ].map((category, i) => (
        <Filter name={category} index={i} />
      ))}
    </StyledFilters>
  );
}