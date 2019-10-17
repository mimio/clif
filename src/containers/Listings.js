import { connect } from 'react-redux';
import { selectFeatureList } from 'modules/geojson';
import Listings from '../components/listings/Listings';

export default connect(
  state => ({
    list: selectFeatureList(state),
  }),
  null,
)(Listings);
