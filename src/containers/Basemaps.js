import { connect } from 'react-redux';
import Basemaps from 'components/map/controls/Basemaps';
import { selectSelectedBasemap, selectBasemap } from '../modules/map';

export default connect(
  state => ({ selectedBasemap: selectSelectedBasemap(state) }),
  { selectBasemap },
)(Basemaps);
