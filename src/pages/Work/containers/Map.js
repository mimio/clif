import { connect } from 'react-redux';
import {
  clearSelection,
  hoverFeature,
  setMapLoaded,
  selectFeature,
  selectMapConfig,
  selectMapLayers,
  selectMapLoaded,
  unhoverFeature,
  resetMap,
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
    setMapLoaded,
    selectFeature,
    unhoverFeature,
    resetMap,
  },
)(Map);
