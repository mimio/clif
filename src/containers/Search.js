import { connect } from 'react-redux';
import Search from '../components/search/SearchBar';
import { updateSearch } from '../modules/filters';

export default connect(
  null,
  { updateSearch },
)(Search);
