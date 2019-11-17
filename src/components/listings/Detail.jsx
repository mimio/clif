import React from 'react';
import PropTypes from 'prop-types';
import { getStyle, size } from 'styles';
import styled from '@emotion/styled';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Antonio;
  color: ${getStyle('limeGreen')};
  background: transparent;
  padding: 20px 0;
`;

const BigButton = styled.button`
  height: 100px;
  width: 100%;
  color: ${getStyle('limeGreen')};
  cursor: pointer;
  &:hover {
    color: ${getStyle('gray')};
    background: ${getStyle('limeGreen')};
  }
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  background: none;
  outline: 0;
  border: none;
  box-shadow: inset 0 0 0 5px ${getStyle('limeGreen')};
  padding: 20px;
`;

const Inner = styled.div`
  margin: ${size(4)};
`;

const StyledName = styled.div`
  font-size: 27px;
  text-transform: uppercase;
  margin: 20px 0px;
`;

const StyledDescription = styled.div`
  font-size: 16px;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.2;
  margin-bottom: 20px;
`;

// allows the details to have an exit transition without a blip of empty data
let lastFeature = {};

const Detail = ({ className, clearSelection, feature }) => {
  if (feature) lastFeature = feature;
  const { Name, ShortDescription } = feature || lastFeature;

  return (
    <Container className={className}>
      <Inner>
        <StyledName>{Name}</StyledName>
        <StyledDescription>{ShortDescription}</StyledDescription>
        <BigButton onClick={clearSelection}>
          <span>Go Back</span>
        </BigButton>
      </Inner>
    </Container>
  );
};

Detail.propTypes = {
  className: PropTypes.string,
  clearSelection: PropTypes.func.isRequired,
  feature: PropTypes.object,
};

Detail.defaultProps = {
  className: '',
  feature: {},
};

export default Detail;
