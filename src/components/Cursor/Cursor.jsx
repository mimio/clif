import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { MouseCoordPropType } from 'utils/prop-types';
import { getBool, getProp, getStyle, size } from 'styles';

const Container = styled.div`
  pointer-events: none;
  position: absolute;
  height: 100%;
  width: 100%;
  left: 0;
  bottom: 0;
  z-index: 1000;
`;

const StyledCursor = styled.div`
  pointer-events: none;
  position: absolute;
  top: ${getProp('y')}px;
  left: ${getProp('x')}px;
  height: ${size(5)};
  width: ${size(5)};
  ${getBool(
    'isActive',
    `
    height: ${size(8)};
    width: ${size(8)};
  `,
  )};
  transition: ${getStyle('easeOutSize')};
  background: ${getStyle('ctaBackground2')};
`;

const Cursor = ({ isCursorActive, mouseCoordinates: [x, y] }) => (
  <Container>
    <StyledCursor isActive={isCursorActive} x={x} y={y} />
  </Container>
);

Cursor.propTypes = {
  isCursorActive: PropTypes.bool.isRequired,
  mouseCoordinates: MouseCoordPropType.isRequired,
};

export default Cursor;
