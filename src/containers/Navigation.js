import { connect } from 'react-redux';
import { selectSelectedTab } from 'modules/app';
import Navigation from '../components/Navigation';

export default connect(
  state => ({ selectedTab: selectSelectedTab(state) }),
  null,
)(Navigation);
