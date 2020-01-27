import { connect } from 'react-redux';
import {
  clearSelection,
  hoverFeature,
  mapLoaded,
  selectFeature,
  selectMapConfig,
  selectMapLayers,
  selectMapLoaded,
  unhoverFeature,
} from 'modules/map';
import Map from '../Map';

export default connect(
  state => ({
    isMapLoaded: selectMapLoaded(state),
    mapConfig: selectMapConfig(state),
    mapLayers: selectMapLayers(state),
  }),
  {
    clearSelection,
    hoverFeature,
    mapLoaded,
    selectFeature,
    unhoverFeature,
  },
)(Map);
