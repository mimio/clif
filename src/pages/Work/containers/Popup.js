import { connect } from 'react-redux';
import { selectIsMobile } from 'modules/app';
import {
  selectSelectedFeature,
  selectPopupId,
  selectIsFeatureSelected,
} from 'modules/map';
import Popup from '../Popup';

export default connect(
  state => ({
    feature: selectSelectedFeature(state),
    isMobile: selectIsMobile(state),
    popupId: selectPopupId(state),
    isFeatureSelected: selectIsFeatureSelected(state),
  }),
  null,
)(Popup);
