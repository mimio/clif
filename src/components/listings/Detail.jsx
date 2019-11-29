import React from 'react';
import PropTypes from 'prop-types';
import { getStyle, size } from 'styles';
import styled from '@emotion/styled';
import { Column } from '../layout';

const Container = styled.div`
  width: 100%;
  height: 100%;
  font-family: Antonio;
  color: ${getStyle('limeGreen')};
  background: transparent;
  overflow: scroll;
`;

const BigButton = styled.button`
  height: ${size(25)};
  width: calc(100% - ${size(10)});
  transition: ${getStyle('hue')};
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
  transition: ${getStyle('limeGreen')};
  padding: ${size(5)};
  margin: ${size(5)};
`;

const IMAGE_HEIGHT = size(70);

const Inner = styled(Column)`
  padding: 0 ${size(4)};
  width: 100%;
  height: calc(100% - ${IMAGE_HEIGHT} - ${size(35)});
  overflow-y: auto;
  > * {
    width: 100%;
    padding: ${size(8)} ${size(5)};
  }
  > *:not(:last-child) {
    position: relative;
    ::after {
      content: '';
      position: absolute;
      height: 1px;
      bottom: 0;
      left: ${size(5)};
      width: calc(100% - ${size(10)});
      background-color: ${getStyle('limeGreen')};
    }
  }
`;

const StyledName = styled.div`
  font-size: 27px;
  text-transform: uppercase;
`;

const StyledDescription = styled.div`
  font-size: 16px;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.2;
  margin-bottom: ${size(5)};
  color: ${getStyle('darkLimeGreen')};
`;

const ImageContainer = styled.div`
  height: ${IMAGE_HEIGHT};
  width: 100%;
  background-image: url('http://www.addalittledazzle.com/wp-content/uploads/2015/07/banana-e1436314532597.jpg');
`;

// allows the details to have an exit transition without a blip of empty data
let lastFeature = {};

const Detail = ({ className, clearSelection, feature }) => {
  if (feature) lastFeature = feature;
  const { Name, ShortDescription } = feature || lastFeature;

  return (
    <Container className={className}>
      <ImageContainer />
      <Inner>
        <StyledName>{Name}</StyledName>
        <StyledDescription>{ShortDescription}</StyledDescription>
      </Inner>
      <BigButton onClick={clearSelection}>
        <span>Go Back</span>
      </BigButton>
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
