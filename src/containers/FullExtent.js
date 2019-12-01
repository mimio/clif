import { connect } from 'react-redux';
import FullExtent from 'components/map/controls/FullExtent';
import { resetMap } from '../modules/map';

export default connect(
  null,
  { zoomToFullExtent: resetMap },
)(FullExtent);
