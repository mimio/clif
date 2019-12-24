import { connect } from 'react-redux';
import {
  shufflePolygon,
  selectIsPolygonLoading,
} from 'modules/polygon';
import ShufflePolygonButton from '../components/ShufflePolygonButton';

export default connect(
  state => ({
    isLoading: selectIsPolygonLoading(state),
  }),
  { shufflePolygon },
)(ShufflePolygonButton);
