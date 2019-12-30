import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
  addProgress,
  selectSelectedTab,
  selectTab,
} from 'modules/app';
import { shufflePolygon } from 'modules/polygon';
import App from '../App';

export default withRouter(
  connect(
    state => ({ selectedTab: selectSelectedTab(state) }),
    { addProgress, selectTab, shufflePolygon },
  )(App),
);
