import { connect } from 'react-redux';
import {
  fitBounds,
  selectIsFeatureSelected,
  selectIsFirstFeatureSelected,
  selectIsLastFeatureSelected,
  selectNextFeature,
  selectPrevFeature,
} from 'modules/map';
import Controls from '../Controls';

export default connect(
  (state) => ({
    isFeatureSelected: selectIsFeatureSelected(state),
    isFirstFeatureSelected: selectIsFirstFeatureSelected(state),
    isLastFeatureSelected: selectIsLastFeatureSelected(state),
  }),
  { fitBounds, selectNextFeature, selectPrevFeature },
)(Controls);
