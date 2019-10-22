import { connect } from 'react-redux';
import Detail from '../components/listings/Detail';
import {
  selectSelectedFeature,
  clearSelection,
} from '../modules/geojson';

export default connect(
  state => ({
    feature: selectSelectedFeature(state),
  }),
  { clearSelection },
)(Detail);
