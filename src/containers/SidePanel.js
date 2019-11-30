import { connect } from 'react-redux';
import { toggleSidePanel, selectSidePanelOpen } from 'modules/app';
import SidePanel from '../components/panel/SidePanel';

import {
  selectShowDetailView,
  selectIsLoading,
} from '../modules/app/selectors';

export default connect(
  state => ({
    showing: selectSidePanelOpen(state),
    showDetailView: selectShowDetailView(state),
    isLoading: selectIsLoading(state),
  }),
  { toggleSidePanel },
)(SidePanel);
