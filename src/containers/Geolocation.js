import { connect } from 'react-redux';
import Geolocation from 'components/map/controls/Geolocation';

import { panToUser, setUserLocation } from '../modules/map';

export default connect(
  null,
  { panToUser, setUserLocation },
)(Geolocation);
