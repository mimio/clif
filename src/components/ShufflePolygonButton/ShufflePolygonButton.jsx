import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { getStyle, size } from 'styles';
import { centered } from 'styles/layout';
import { ReactComponent as NextIcon } from './next.svg';

const Circle = styled.div`
  width: ${size(13)};
  height: ${size(13)};
  background: ${getStyle('ctaBackground1')};
`;

const Indicator = styled.div`
  width: ${size(20)};
  height: ${size(20)};
  background: transparent;
  border: 1px solid ${getStyle('ctaBackground1')};
`;

const Button = styled.button`
  width: ${size(28)};
  height: ${size(28)};
  border-radius: 50%;
  transition: ${getStyle('linearHue')};
  color: ${getStyle('text2')};
  > div {
    position: absolute;
    border-radius: 50%;
    transition: ${getStyle('linearHue')}, ${getStyle('easeOutSize')};
  }
  &:hover {
    color: ${getStyle('text1')};
    ${Circle} {
      width: ${size(16)};
      height: ${size(16)};
      background: ${getStyle('ctaBackground2')};
    }
    ${Indicator} {
      width: ${size(24)};
      height: ${size(24)};
      border-color: ${getStyle('ctaBackground2')};
    }
  }
  &:active {
    ${Circle} {
      width: ${size(15)};
      height: ${size(15)};
      background: ${getStyle('ctaBackground2')};
    }
    ${Indicator} {
      width: ${size(23)};
      height: ${size(23)};
      border-color: ${getStyle('ctaBackground2')};
    }
  }
  background: transparent;
  border: none;
  ${centered};
  ${({ isLoading }) =>
    isLoading
      ? `
        pointer-events: none;
      `
      : ``};
`;

const ShufflePolygonButton = ({
  className,
  isLoading,
  shufflePolygon,
}) => (
  <Button
    className={className}
    onClick={isLoading ? () => {} : shufflePolygon}
    isLoading={isLoading}
  >
    <Circle />
    <Indicator />
    <NextIcon />
  </Button>
);

ShufflePolygonButton.propTypes = {
  className: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  shufflePolygon: PropTypes.func.isRequired,
};

ShufflePolygonButton.defaultProps = {
  className: '',
};

export default ShufflePolygonButton;
