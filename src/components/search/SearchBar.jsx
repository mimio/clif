import React from 'react';
import { getStyle, size } from 'styles';
import styled from '@emotion/styled';

const StyledSearch = styled.div`
  height: ${getStyle('searchBarHeight')};
  width: 100%;
  position: relative;
  background: ${getStyle('offWhite')};
`;

const SearchInput = styled.input`
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  outline: 0;
  border: 0;
  background: none;
  margin-left: ${size(4)};
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
