import { connect } from 'react-redux';
import SidePanel from '../components/panel/SidePanel';
import { toggleSidePanel, selectSidePanelOpen } from 'modules/app';

export default connect(
  state => ({ showing: selectSidePanelOpen(state) }),
  { toggleSidePanel },
)(SidePanel);
