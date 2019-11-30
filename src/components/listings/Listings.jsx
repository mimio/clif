import React from 'react';
import { size } from 'styles';
import styled from '@emotion/styled';

import Listing from './Listing';
import Detail from '../../containers/Detail';

const StyledListings = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  overflow: auto;
  overflow: overlay; /* only works in Chrome, Safari */
`;

const Inner = styled.ul`
  margin: ${size(4)};
`;

const List = ({
  list,
  selectFeature,
  hoverFeature,
  unhoverFeature,
}) => (
  <Inner>
    {list.map(item => (
      <Listing
        key={item.id}
        onClick={selectFeature}
        onMouseEnter={hoverFeature}
        onMouseLeave={unhoverFeature}
        item={item}
      />
    ))}
  </Inner>
);

export default function Listings({
  className,
  list,
  selectFeature,
  hoverFeature,
  unhoverFeature,
  showDetails,
}) {
  return (
    <StyledListings className={className}>
      {!showDetails ? (
        <List
          list={list}
          selectFeature={selectFeature}
          hoverFeature={hoverFeature}
          unhoverFeature={unhoverFeature}
        />
      ) : (
        <Detail />
      )}
    </StyledListings>
  );
}
