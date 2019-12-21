import { connect } from 'react-redux';
import { selectSelectedTab } from 'modules/app';
import Information from '../components/Information';

export default connect(
  state => ({ selectedTab: selectSelectedTab(state) }),
  null,
)(Information);
