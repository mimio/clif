import React, { useRef } from 'react';
import { getStyle, size } from 'styles';
import styled from '@emotion/styled';
import { Row } from '../layout';
import { ReactComponent as SearchIcon } from './search.svg';

const StyledSearch = styled(Row)`
  height: ${getStyle('searchBarHeight')};
  width: 100%;
  position: relative;
  flex-shrink: 0;
  background: white;
`;

const SearchButton = styled.button`
  width: 72px;
  height: 100%;
  padding: 20px;
  border: none;
  background: none;
  outline: none;
  cursor: pointer;
  svg {
    transition: ${getStyle('hue')};
    opacity: 0.8;
    color: ${getStyle('limeGreen')};
  }
  &:hover {
    svg {
      opacity: 1;
    }
  }
`;

const SearchInput = styled.input`
  color: ${getStyle('limeGreen')};
  font-size: 18pt;
  font-family: Antonio;
  font-weight: bold;
  height: 100%;
  width: 100%;
  padding: ${size(2)};
  margin: 0;
  outline: 0;
  border: 0;
  ::placeholder {
    color: ${getStyle('limeGreen')};
  }
`;

export default function SearchBar({ updateSearch }) {
  const refInput = useRef();

  return (
    <StyledSearch>
      <SearchInput
        onChange={e => updateSearch(e.target.value)}
        placeholder="Search..."
        ref={refInput}
      />
      <SearchButton onClick={() => refInput.current.focus()}>
        <SearchIcon />
      </SearchButton>
    </StyledSearch>
  );
}
