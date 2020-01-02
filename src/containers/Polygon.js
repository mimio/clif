import { connect } from 'react-redux';
import { selectModel } from 'modules/polygon';
import {
  selectProgress,
  selectNormalizedMouseCoordinates,
} from 'modules/app';
import Polygon from '../components/Polygon';

export default connect(
  state => ({
    model: selectModel(state),
    progress: selectProgress(state),
    mouseCoordinates: selectNormalizedMouseCoordinates(state),
  }),
  null,
)(Polygon);
