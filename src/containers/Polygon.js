import { connect } from 'react-redux';
import { selectModel } from 'modules/polygon';
import Polygon from '../components/Polygon';

export default connect(
  state => ({
    model: selectModel(state),
  }),
  null,
)(Polygon);
