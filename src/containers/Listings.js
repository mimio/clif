import { connect } from 'react-redux';

import Listings from '../components/listings/Listings';
import {
  selectFilteredResults,
  selectFeature,
} from '../modules/geojson';

export default connect(
  state => ({
    list: selectFilteredResults(state),
  }),
  { selectFeature },
)(Listings);
