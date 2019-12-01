import { connect } from 'react-redux';
import NextPrevSelector from '../components/listings/NextPrevSelector';
import { selectNextFeature, selectPrevFeature } from '../modules/map';

export default connect(
  null,
  {
    onNext: selectNextFeature,
    onPrev: selectPrevFeature,
  },
)(NextPrevSelector);
