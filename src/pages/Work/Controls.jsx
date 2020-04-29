import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Button, Row } from 'components';
import { getStyle } from 'styles';
import { ArrowLeftIcon, ArrowRightIcon, ExpandIcon } from 'icons';

const Container = styled(Row)`
  height: 56px;
  border-radius: 28px;
  padding: 12px;
  background: ${getStyle('controlBackdrop')};
`;

const Controls = ({
  className,
  fitBounds,
  isFeatureSelected,
  isFirstFeatureSelected,
  isLastFeatureSelected,
  selectNextFeature,
  selectPrevFeature,
}) => (
  <Container className={className} sp={3}>
    <Button onClick={fitBounds} Icon={ExpandIcon} />

    <Button
      disabled={isFirstFeatureSelected || !isFeatureSelected}
      onClick={selectPrevFeature}
      Icon={ArrowLeftIcon}
    />
    <Button
      disabled={isLastFeatureSelected || !isFeatureSelected}
      onClick={selectNextFeature}
      Icon={ArrowRightIcon}
    />
  </Container>
);

Controls.propTypes = {
  className: PropTypes.string,
  fitBounds: PropTypes.func.isRequired,
  isFeatureSelected: PropTypes.bool.isRequired,
  isFirstFeatureSelected: PropTypes.bool.isRequired,
  isLastFeatureSelected: PropTypes.bool.isRequired,
  selectNextFeature: PropTypes.func.isRequired,
  selectPrevFeature: PropTypes.func.isRequired,
};

Controls.defaultProps = {
  className: '',
};

export default Controls;
