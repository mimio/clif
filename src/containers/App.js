import { connect } from 'react-redux';
import { fetchData } from 'modules/geojson';
import App from '../App';

export default connect(
  null,
  {
    fetchData,
  },
)(App);
