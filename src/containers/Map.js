import { connect } from 'react-redux';
import Map from '../components/map/Map';

import { selectMapLayers, selectMapConfig } from '../modules/map';

export default connect(
  state => ({
    mapLayers: selectMapLayers(state),
    mapConfig: selectMapConfig(state),
  }),
  null,
)(Map);
