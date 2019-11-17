import React from 'react';
import { POINT, LINE, POLYGON } from 'constants/featureTypes';
import { getStyle, size } from 'styles';
import styled from '@emotion/styled';
import { ReactComponent as SnowmobileIcon } from './snowmobile.svg';
import { ReactComponent as PolygonIcon } from './polygon.svg';

const Container = styled.div`
  background: ${getStyle('lightGray')};
  height: ${getStyle('listingHeight')};
  width: 100%;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  color: ${getStyle('limeGreen')};
  margin-bottom: ${size(4)};
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

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  line-height: 1.5;
`;

const StyledName = styled.span`
  font-family: Antonio;
  font-weight: 700;
  font-size: 20px;
  text-transform: uppercase;
`;

const StyledDescription = styled.span`
  font-size: 16px;
`;

const StyledSnowmobileIcon = styled(SnowmobileIcon)`
  width: 100%;
  color: #303132;
`;

const StyledPolygonIcon = styled(PolygonIcon)`
  width: 100%;
`;

const WaypointIcon = styled.div`
  background: none;
  border: 8px solid ${getStyle('darkLimeGreen')};
  border-radius: 50%;
  height: ${size(4)};
  width: ${size(4)};
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${getStyle('listingHeight')};
  width: ${size(16)};
  padding: 0 ${size(5)};
`;

const getIcon = type => {
  switch (type) {
    case POINT:
      return WaypointIcon;
    case LINE:
      return StyledSnowmobileIcon;
    case POLYGON:
      return StyledPolygonIcon;
    default:
      return null;
  }
};

const getDescription = (item = {}) => {
  const { type } = item;
  switch (type) {
    case POINT:
      return '6000ft';
    case LINE:
      return `${item.miles}M | +/- 1000ft`;
    case POLYGON:
      return '1000 sq ft';
    default:
      return null;
  }
};

export default function Listing({
  item: { Name, UID, type },
  item,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const source = type === POINT ? 'waypoints' : 'trails';
  const Icon = getIcon(type);
  return (
    <Container
      onClick={() => onClick({ id: UID, source })}
      onMouseEnter={() => onMouseEnter({ id: UID, source })}
      onMouseLeave={() => onMouseLeave({ id: UID, source })}
    >
      <IconContainer>
        <Icon />
      </IconContainer>
      <NameContainer>
        <StyledName>{Name}</StyledName>
        <StyledDescription>{getDescription(item)}</StyledDescription>
      </NameContainer>
    </Container>
  );
}
