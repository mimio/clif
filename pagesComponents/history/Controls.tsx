import styled from '@emotion/styled';
import Button from 'components/Button';
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

export type ControlsProps = {
  className?: string;
  fitBounds: () => void;
  isFeatureSelected: boolean;
  isFirstFeatureSelected: boolean;
  isLastFeatureSelected: boolean;
  selectNextFeature: () => void;
  selectPrevFeature: () => void;
};

const Controls = ({
  className = '',
  fitBounds,
  isFeatureSelected,
  isFirstFeatureSelected,
  isLastFeatureSelected,
  selectNextFeature,
  selectPrevFeature,
}: ControlsProps) => (
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

export default Controls;
