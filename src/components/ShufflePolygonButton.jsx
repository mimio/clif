import React from 'react';
import PropTypes from 'prop-types';
import { getStyle } from 'styles';
import styled from '@emotion/styled';

const Button = styled.button`
  border-radius: 50%;
  color: ${getStyle('text1')};
  background: ${getStyle('ctaBackground1')};
  transition: ${getStyle('hue')};
  ${({ isLoading }) =>
    isLoading
      ? `
        pointer-events: none;
      `
      : ``};
`;

const NextPolygonButton = ({ isLoading, shufflePolygon }) => (
  <Button
    onClick={isLoading ? () => {} : shufflePolygon}
    isLoading={isLoading}
  >
    next
  </Button>
);

NextPolygonButton.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  shufflePolygon: PropTypes.func.isRequired,
};
