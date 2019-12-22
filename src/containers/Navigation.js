import { connect } from 'react-redux';
import { selectSelectedTab, selectProgress } from 'modules/app';
import Navigation from '../components/Navigation';

export default connect(
  state => ({
    selectedTab: selectSelectedTab(state),
    progress: selectProgress(state),
  }),
  null,
)(Navigation);
