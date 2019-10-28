import { connect } from 'react-redux';
import Map from '../components/map/Map';
import {
  selectGeoJson,
  selectTrailGeoJson,
} from '../modules/geojson/selectors';
import { selectMapLayers, selectMapConfig } from '../modules/map';

export default connect(
  state => ({
    geojson: selectGeoJson(state),
    trailGeoJson: selectTrailGeoJson(state),
    mapLayers: selectMapLayers(state),
    mapConfig: selectMapConfig(state),
  }),
  null,
)(Map);
