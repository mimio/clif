import { connect } from 'react-redux';
import { selectSelectedTab, selectAppProgress } from 'modules/app';
import Navigation from '../components/Navigation';

export default connect(
  state => ({
    selectedTab: selectSelectedTab(state),
    appProgress: selectAppProgress(state),
  }),
  null,
)(Navigation);
