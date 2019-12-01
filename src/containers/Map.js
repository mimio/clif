import { connect } from 'react-redux';
import Map from '../components/map/Map';

import {
  hoverFeature,
  mapLoaded,
  selectFeature,
  selectHoveredFeatureId,
  selectMapConfig,
  selectMapLayers,
  selectMapLoaded,
  unhoverFeature,
} from '../modules/map';

export default connect(
  state => ({
    mapLayers: selectMapLayers(state),
    mapConfig: selectMapConfig(state),
    isMapLoaded: selectMapLoaded(state),
    hoveredFeatureId: selectHoveredFeatureId(state),
  }),
  {
    hoverFeature,
    unhoverFeature,
    mapLoaded,
    selectFeature,
  },
)(Map);
