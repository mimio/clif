import { connect } from 'react-redux';
import Map from '../components/map/Map';
import { selectGeoJson } from '../modules/geojson/selectors';

export default connect(
  state => ({
    geojson: selectGeoJson(state),
  }),
  null,
)(Map);
