import React from 'react';
import { getStyle, size } from 'styles';
import styled from '@emotion/styled';

const StyledSearch = styled.div`
  height: ${getStyle('searchBarHeight')};
  padding: ${size(2)};
  background: ${getStyle('gray')};
  width: 100%;
  position: relative;
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  color: ${getStyle('limeGreen')};
  border-radius: 6px;
  height: ${getStyle('searchBarHeight')};
  font-size: 18pt;
  font-family: Antonio;
  font-weight: bold;
  height: 100%;
  width: 100%;
  padding: ${size(2)};
  margin: 0;
  outline: 0;
  border: 0;
  background: white;

  ::placeholder {
    color: ${getStyle('limeGreen')};
    opacity: 0.7;
  }
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
