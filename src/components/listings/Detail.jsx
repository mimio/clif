import React from 'react';
import PropTypes from 'prop-types';
import { POINT, LINE, POLYGON } from 'constants/sources';
import { getStyle, size, mq } from 'styles';
import styled from '@emotion/styled';
import { Column, Row, ItemRow } from '../layout';
import Video from './Video';
import DetailMetric from './DetailMetric';
import { ReactComponent as Chevron } from '../panel/chevronDown.svg';
import { ReactComponent as Line } from './line.svg';
import { ReactComponent as Ruler } from './ruler.svg';
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
  cursor: pointer;
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
  background-image: ${p =>
    `url(${p.image ||
      'https://61053f0f9fe52485e695-eb3473ee85ccfb740806f4100aeb4704.ssl.cf1.rackcdn.com/2018/03/Snowmobile3-1024x576.png'})`};
  background-repeat: no-repeat;
  background-position-x: center;
  background-position-y: center;
  background-size: cover;
`;

const Header = styled(Row)`
  width: 100%;
  justify-content: space-between;
`;

const Metrics = styled(ItemRow)``;

const getMetrics = ({ source, miles, elevation } = {}) => {
  const elevationMetric = (
    <DetailMetric Icon={Ruler} text={`${elevation}ft`} />
  );
  switch (source) {
    case POINT:
    case POLYGON:
      return elevationMetric;
    case LINE:
      return (
        <>
          {elevationMetric}
          <DetailMetric Icon={Line} text={`${miles}mi`} />
        </>
      );
    default:
      return null;
  }
};

const Detail = ({ clearSelection, feature }) => {
  const { Name, description, image, video } = feature;

  return (
    <DetailContainer>
      {video.length ? (
        <Video url={video} />
      ) : (
        <ImageContainer image={image} />
      )}
      <Inner>
        <Header>
          <StyledName>{Name}</StyledName>
          <NextPrevSelector />
        </Header>
        <Metrics sp={8}>{getMetrics(feature)}</Metrics>
        <StyledDescription>{description}</StyledDescription>
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
