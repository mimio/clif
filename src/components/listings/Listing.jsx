import React from 'react';
import { POINT, LINE, POLYGON } from 'constants/sources';
import { getStyle, size } from 'styles';
import styled from '@emotion/styled';
import { ReactComponent as SnowmobileIcon } from './snowmobile.svg';
import { ReactComponent as PolygonIcon } from './polygon.svg';
import { Centered, Column, Row } from '../layout';

const Container = styled(Row)`
  display: flex;
  justify-content: start;
  align-items: center;
  background: ${getStyle('lightGray')};
  height: ${getStyle('listingHeight')};
  width: 100%;
  flex-shrink: 0;
  border-radius: 16px;
  color: ${getStyle('limeGreen')};
  position: relative;
  user-select: none;
  cursor: pointer;
  -webkit-overflow-scrolling: touch;
  transition: ${getStyle('hue')};
  &:active,
  &:hover {
    background: ${getStyle('limeGreen')};
    color: ${getStyle('gray')};
  }
`;

const NameContainer = styled(Column)`
  align-items: flex-start;
  line-height: 1.5;
`;

const StyledName = styled.span`
  font-family: Antonio;
  font-weight: 700;
  font-size: 20px;
  text-transform: uppercase;
`;

const StyledMetrics = styled.span`
  font-size: 16px;
`;

const StyledSnowmobileIcon = styled(SnowmobileIcon)`
  color: #303132;
`;

const WaypointIcon = styled.div`
  background: none;
  border: 8px solid ${getStyle('darkLimeGreen')};
  border-radius: 50%;
  height: ${size(8)};
  width: ${size(8)};
`;

const IconContainer = styled(Centered)`
  height: 100%;
  width: ${size(22)};
`;

const getIcon = source => {
  switch (source) {
    case POINT:
      return WaypointIcon;
    case LINE:
      return StyledSnowmobileIcon;
    case POLYGON:
      return PolygonIcon;
    default:
      return () => null;
  }
};

const getMetrics = (item = {}) => {
  const { source, miles, elevation } = item;
  switch (source) {
    case POINT:
    case POLYGON:
      return `${elevation}ft`;
    case LINE:
      return `${miles}mi | +/- ${elevation}ft`;
    default:
      return null;
  }
};

export default function Listing({
  item: { Name, id, source },
  item,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const Icon = getIcon(source);
  return (
    <Container
      onClick={() => onClick({ id, source })}
      onMouseEnter={() => onMouseEnter({ id, source })}
      onMouseLeave={() => onMouseLeave({ id, source })}
    >
      <IconContainer>
        <Icon />
      </IconContainer>
      <NameContainer>
        <StyledName>{Name}</StyledName>
        <StyledMetrics>{getMetrics(item)}</StyledMetrics>
      </NameContainer>
    </Container>
  );
}
