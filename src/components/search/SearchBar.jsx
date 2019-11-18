import React from 'react';
import { getStyle, size } from 'styles';
import styled from '@emotion/styled';

const StyledSearch = styled.div`
  height: ${getStyle('searchBarHeight')};
  width: 100%;
  position: relative;
  background: ${getStyle('gray')};
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  color: ${getStyle('limeGreen')};
  font-size: 18pt;
  font-family: Antonio;
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  outline: 0;
  border: 0;
  background: none;
  margin-left: ${size(4)};
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
