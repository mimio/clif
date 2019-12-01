import { connect } from 'react-redux';
import FullExtent from 'components/map/controls/FullExtent';
import { zoomToFullExtent } from '../modules/map';

export default connect(
  null,
  { zoomToFullExtent },
)(FullExtent);
