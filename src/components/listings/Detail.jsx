import React from 'react';
import PropTypes from 'prop-types';
import { getStyle, size, mq } from 'styles';
import styled from '@emotion/styled';
import { Column, Row } from '../layout';
import { ReactComponent as Chevron } from '../panel/chevronDown.svg';
import NextPrevSelector from '../../containers/NextPrevSelector';

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  font-family: Antonio;
  position: relative;
  color: ${getStyle('limeGreen')};
  background: transparent;
  overflow: overlay;
`;

const BigButton = styled.button`
  display: ${mq({ display: ['none', 'unset'] })}
  justify-content: center;
  align-items: center;
  min-height: ${size(25)};
  color: ${getStyle('limeGreen')};
  cursor: pointer;
  &:hover {
    color: ${getStyle('gray')};
    background: ${getStyle('limeGreen')};
  }
  text-transform: uppercase;
  background: none;
  outline: 0;
  border: none;
  box-shadow: inset 0 0 0 5px ${getStyle('limeGreen')};
  padding: ${size(5)};
  margin: ${size(5)};
`;

const Inner = styled(Column)`
  width: 100%;
  ${mq({
    height: ['100%', 'unset'],
  })}
  flex-shrink: 0;

  display: flex;
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

const MobileBackButton = styled.button`
  background: ${getStyle('limeGreen')};
  outline: 0;
  border: none;
  padding: ${size(4)};
  position: absolute;
  left: ${size(2)};
  top: ${size(2)};
  display: ${mq({ display: ['flex', 'none'] })};
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  > svg {
    transform: rotate(90deg);
    height: 12px;
    width: 12px;
    margin-right: ${size(1)};
  }
`;

const StyledName = styled.div`
  font-size: 27px;
  text-transform: uppercase;
  width: 100%;
`;

const StyledDescription = styled.div`
  font-size: 16px;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.2;
  margin-bottom: ${size(5)};
  color: ${getStyle('darkLimeGreen')};
`;

const ImageContainer = styled.div`
  width: 100%;
  min-height: 30%;
  background-image: url('http://www.addalittledazzle.com/wp-content/uploads/2015/07/banana-e1436314532597.jpg');
  background-repeat: no-repeat;
  background-position-x: center;
  background-size: cover;
`;

const Header = styled(Row)`
  width: 100%;
  justify-content: space-between;
`;

const Detail = ({ clearSelection, feature }) => {
  const { Name, ShortDescription } = feature;

  return (
    <DetailContainer>
      <ImageContainer />
      <Inner>
        <Header>
          <StyledName>{Name}</StyledName>
          <NextPrevSelector />
        </Header>
        <StyledDescription>{ShortDescription}</StyledDescription>
      </Inner>
      <BigButton onClick={clearSelection}>
        <span>Go Back</span>
      </BigButton>
      <MobileBackButton onClick={clearSelection}>
        <Chevron />
        <span>Back</span>
      </MobileBackButton>
    </DetailContainer>
  );
};

Detail.propTypes = {
  clearSelection: PropTypes.func.isRequired,
  feature: PropTypes.object,
};

Detail.defaultProps = {
  feature: {},
};

export default Detail;
