import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import Button from 'components/CTA/Button';
import { Row } from 'components/layout';
import { getStyle } from 'styles/utils';
import ArrowLeftIcon from 'public/icons/arrow-left.svg';
import ArrowRightIcon from 'public/icons/arrow-right.svg';
import ExpandIcon from 'public/icons/expand.svg';

const Container = styled(Row)`
  height: 56px;
  border-radius: 28px;
  padding: 12px;
  background: ${getStyle('controlBackdrop')};
`;

const Controls = ({
  className = '',
  fitBounds,
  isFeatureSelected,
  isFirstFeatureSelected,
  isLastFeatureSelected,
  selectNextFeature,
  selectPrevFeature,
}) => (
  <Container className={className} sp={3}>
    <Button
      ariaLabel="Reset Map Extent"
      onClick={fitBounds}
      Icon={ExpandIcon}
    />

    <Button
      ariaLabel="Go To Previous Feature"
      disabled={isFirstFeatureSelected || !isFeatureSelected}
      onClick={selectPrevFeature}
      Icon={ArrowLeftIcon}
    />
    <Button
      ariaLabel="Go To Next Feature"
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

export default Controls;
