import { connect } from 'react-redux';
import { selectMapLoaded } from 'modules/map/selectors';
import {
  clearSelection,
  hoverFeature,
  setMapLoaded,
  selectFeature,
  unhoverFeature,
  resetMap,
} from 'modules/map/actions';
import Map from '../Map';

export default connect(
  (state) => ({
    isMapLoaded: selectMapLoaded(state),
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
