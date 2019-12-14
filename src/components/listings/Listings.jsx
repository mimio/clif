import React from 'react';
import { getStyle, size } from 'styles';
import styled from '@emotion/styled';

import Listing from './Listing';
import Detail from '../../containers/Detail';
import { ItemColumn } from '../layout';

const StyledListings = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  overflow: auto;
  overflow: overlay; /* only works in Chrome, Safari */
`;

const NoResults = styled.span`
  color: ${getStyle('limeGreen')};
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial,
    sans-serif;
  margin-top: 48px;
  font-size: 24px;
`;

const Inner = styled(ItemColumn.withComponent('ul'))`
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
    {list.length < 1 && <NoResults>No Results</NoResults>}
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
