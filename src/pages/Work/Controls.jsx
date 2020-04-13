import React from 'react';
import PropTypes from 'prop-types';
// import styled from '@emotion/styled';
import { Button, Row } from 'components';
import { ArrowLeftIcon, ArrowRightIcon, ExpandIcon } from 'icons';

const Controls = ({
  className,
  fitBounds,
  isFeatureSelected,
  isFirstFeatureSelected,
  isLastFeatureSelected,
  selectNextFeature,
  selectPrevFeature,
}) => (
  <Row className={className} sp={4}>
    <Button onClick={fitBounds} Icon={ExpandIcon} />
    {isFeatureSelected && (
      <>
        <Button
          disabled={isFirstFeatureSelected}
          onClick={selectPrevFeature}
          Icon={ArrowLeftIcon}
        />
        <Button
          disabled={isLastFeatureSelected}
          onClick={selectNextFeature}
          Icon={ArrowRightIcon}
        />
      </>
    )}
  </Row>
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
