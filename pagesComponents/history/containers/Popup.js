import { connect } from 'react-redux';
import { selectIsMobile } from 'modules/app/selectors';
import {
  selectSelectedFeature,
  selectPopupId,
  selectIsFeatureSelected,
} from 'modules/map/selectors';
import Popup from '../Popup';

export default connect(
  (state) => ({
    feature: selectSelectedFeature(state),
    isMobile: selectIsMobile(state),
    popupId: selectPopupId(state),
    isFeatureSelected: selectIsFeatureSelected(state),
  }),
  null,
)(Popup);
