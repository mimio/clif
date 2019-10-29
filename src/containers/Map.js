import { connect } from 'react-redux';
import Map from '../components/map/Map';

import {
  selectMapLayers,
  selectMapConfig,
  hoverFeature,
  unhoverFeature,
  mapLoaded,
  selectHoveredFeatureId,
  selectMapLoaded,
} from '../modules/map';

export default connect(
  state => ({
    mapLayers: selectMapLayers(state),
    mapConfig: selectMapConfig(state),
    isMapLoaded: selectMapLoaded(state),
    hoveredFeatureId: selectHoveredFeatureId(state),
  }),
  { hoverFeature, unhoverFeature, mapLoaded },
)(Map);
