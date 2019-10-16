import { connect } from 'react-redux';
import { toggleSidePanel, selectSidePanelOpen } from 'modules/app';
import SidePanel from '../components/panel/SidePanel';

export default connect(
  state => ({ showing: selectSidePanelOpen(state) }),
  { toggleSidePanel },
)(SidePanel);
