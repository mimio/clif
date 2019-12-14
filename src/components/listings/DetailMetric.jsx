import React from 'react';
import PropTypes from 'prop-types';
import { getStyle, size } from 'styles';
import styled from '@emotion/styled';
import { Column } from '../layout';

const Container = styled(Column)`
  justify-content: space-between;
  height: ${size(17)};
  font-family: Antonio;
  position: relative;
  color: ${getStyle('limeGreen')};
  background: transparent;
  overflow: overlay;
  padding: 4px;
  svg {
    width: 36px;
  }
`;

const DetailMetric = ({ Icon, text }) => (
  <Container sp={5}>
    <Icon />
    <span>{text}</span>
  </Container>
);

DetailMetric.propTypes = {
  Icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
};

export default DetailMetric;
