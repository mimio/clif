import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { selectTab, selectSelectedTab } from 'modules/app';
import App from '../App';

export default withRouter(
  connect(
    state => ({ selectedTab: selectSelectedTab(state) }),
    { selectTab },
  )(App),
);
