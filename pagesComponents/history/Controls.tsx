import Button from 'components/Button';
import { cn } from 'utils/cn';
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
    <div
      className={cn(
        'flex h-14 items-center gap-3 rounded-[28px] bg-backdrop p-3',
        className,
      )}
    >
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
    </div>
  );
};

export default Controls;
