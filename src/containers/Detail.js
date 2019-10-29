import { connect } from 'react-redux';
import Detail from '../components/listings/Detail';
import {
  selectSelectedFeature,
  clearSelection,
} from '../modules/map';

export default connect(
  state => ({
    feature: selectSelectedFeature(state),
  }),
  { clearSelection },
)(Detail);
