import { connect } from 'react-redux';
import {
  selectIsFeatureSelected,
  selectIsFirstFeatureSelected,
  selectIsLastFeatureSelected,
} from 'modules/map/selectors';
import {
  fitBounds,
  selectNextFeature,
  selectPrevFeature,
} from 'modules/map/actions';
import Controls from '../Controls';

export default connect(
  (state) => ({
    isFeatureSelected: selectIsFeatureSelected(state),
    isFirstFeatureSelected: selectIsFirstFeatureSelected(state),
    isLastFeatureSelected: selectIsLastFeatureSelected(state),
  }),
  { fitBounds, selectNextFeature, selectPrevFeature },
)(Controls);
