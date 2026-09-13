import { connect } from 'react-redux';
import type { RootState } from 'modules/store';
import { selectIsMobile } from 'modules/app/selectors';
import {
  selectSelectedFeature,
  selectPopupId,
  selectIsFeatureSelected,
} from 'modules/map/selectors';
import Popup from '../Popup';

export default connect(
  (state: RootState) => ({
    feature: selectSelectedFeature(state),
    isMobile: selectIsMobile(state),
    popupId: selectPopupId(state),
    isFeatureSelected: selectIsFeatureSelected(state),
  }),
  null,
)(Popup);
