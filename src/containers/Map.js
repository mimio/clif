import { connect } from 'react-redux';
import Map from '../components/map/Map';

import {
  selectMapLayers,
  selectMapConfig,
  hoverFeature,
  unhoverFeature,
  selectHoveredFeatureId,
} from '../modules/map';

export default connect(
  state => ({
    mapLayers: selectMapLayers(state),
    mapConfig: selectMapConfig(state),
    hoveredFeatureId: selectHoveredFeatureId(state),
  }),
  { hoverFeature, unhoverFeature },
)(Map);
