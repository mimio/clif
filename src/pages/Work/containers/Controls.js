import { connect } from 'react-redux';
import { fitBounds } from 'modules/map';
import Controls from '../Controls';

export default connect(
  null,
  { fitBounds },
)(Controls);
