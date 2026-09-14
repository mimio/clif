import { connect } from 'react-redux';
import type { RootState } from 'modules/store';
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
  (state: RootState) => ({
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
