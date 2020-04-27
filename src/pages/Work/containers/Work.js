import { connect } from 'react-redux';
import { selectIsMobile } from 'modules/app';
import Work from '../Work';

export default connect(
  (state) => ({
    isMobile: selectIsMobile(state),
  }),
  null,
)(Work);
