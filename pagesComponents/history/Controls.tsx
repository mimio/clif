import styled from '@emotion/styled';
import Button from 'components/Button';
import { Row } from 'components/layout';
import { getStyle } from 'styles/utils';
import { useAppDispatch, useAppSelector } from 'modules/hooks';
import {
  selectIsFeatureSelected,
  selectIsFirstFeatureSelected,
  selectIsLastFeatureSelected,
} from 'modules/map/mapSlice';
import {
  fitBounds,
  selectNextFeature,
  selectPrevFeature,
} from 'modules/map/mapThunks';
import ArrowLeftIcon from 'public/icons/arrow-left.svg';
import ArrowRightIcon from 'public/icons/arrow-right.svg';
import ExpandIcon from 'public/icons/expand.svg';

const Container = styled(Row)`
  height: 56px;
  border-radius: 28px;
  padding: 12px;
  background: ${getStyle('controlBackdrop')};
`;

export type ControlsProps = {
  className?: string;
};

const Controls = ({ className = '' }: ControlsProps) => {
  const dispatch = useAppDispatch();
  const isFeatureSelected = useAppSelector(selectIsFeatureSelected);
  const isFirstFeatureSelected = useAppSelector(
    selectIsFirstFeatureSelected,
  );
  const isLastFeatureSelected = useAppSelector(
    selectIsLastFeatureSelected,
  );

  return (
    <Container className={className} sp={3}>
      <Button
        ariaLabel="Reset Map Extent"
        onClick={() => dispatch(fitBounds())}
        Icon={ExpandIcon}
      />

      <Button
        ariaLabel="Go To Previous Feature"
        disabled={isFirstFeatureSelected || !isFeatureSelected}
        onClick={() => dispatch(selectPrevFeature())}
        Icon={ArrowLeftIcon}
      />
      <Button
        ariaLabel="Go To Next Feature"
        disabled={isLastFeatureSelected || !isFeatureSelected}
        onClick={() => dispatch(selectNextFeature())}
        Icon={ArrowRightIcon}
      />
    </Container>
  );
};

export default Controls;
