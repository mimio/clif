import { connect } from 'react-redux';
import {
  selectIsCursorActive,
  selectMouseCoordinates,
} from 'modules/app';
import Cursor from '../components/Cursor';

export default connect(
  state => ({
    isCursorActive: selectIsCursorActive(state),
    mouseCoordinates: selectMouseCoordinates(state),
  }),
  null,
)(Cursor);
