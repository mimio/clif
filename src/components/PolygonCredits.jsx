import React from 'react';
import PropTypes from 'prop-types';
import { getStyle } from 'styles';
import styled from '@emotion/styled';
import { Credits } from './Text';

const StyledCredits = styled(Credits.withComponent('a'))`
  transition: ${getStyle('hue')};
`;

const PolygonCredits = ({ author, url }) => (
  <StyledCredits href={url} target="_blank" rel="noopener noreferrer">
    {author}
  </StyledCredits>
);

PolygonCredits.propTypes = {
  author: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

export default PolygonCredits;
