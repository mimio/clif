import { connect } from 'react-redux';
import { selectSelectedFeature, selectPopupId } from 'modules/map';
import Popup from '../Popup';

export default connect(
  state => ({
    feature: selectSelectedFeature(state),
    popupId: selectPopupId(state),
  }),
  null,
)(Popup);
