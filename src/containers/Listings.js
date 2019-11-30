import { connect } from 'react-redux';

import { selectShowDetailView } from 'modules/app';
import Listings from '../components/listings/Listings';
import { selectFilteredResults } from '../modules/geojson';

import {
  selectFeature,
  hoverFeature,
  unhoverFeature,
} from '../modules/map';

export default connect(
  state => ({
    list: selectFilteredResults(state),
    showDetails: selectShowDetailView(state),
  }),
  { selectFeature, hoverFeature, unhoverFeature },
)(Listings);
