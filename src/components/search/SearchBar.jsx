import React from 'react';
import styled from '@emotion/styled';

const StyledSearch = styled.div`
  height: ${p => p.theme.get('searchBarHeight')};
  width: 100%;
  position: relative;
  background: ${p => p.theme.get('offWhite')};
`;

const SearchInput = styled.input`
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  outline: 0;
  border: 0;
  background: none;
  margin-left: ${p => p.theme.size(4)};
`;

export default function SearchBar({ updateSearch }) {
  return (
    <StyledSearch>
      <SearchInput
        onChange={e => updateSearch(e.target.value)}
        placeholder="Search..."
      />
    </StyledSearch>
  );
}
