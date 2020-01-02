import { connect } from 'react-redux';
import {
  selectPolygonAuthor,
  selectPolygonAuthorUrl,
} from 'modules/polygon';
import PolygonCredits from '../components/PolygonCredits';

export default connect(
  state => ({
    author: selectPolygonAuthor(state),
    url: selectPolygonAuthorUrl(state),
  }),
  null,
)(PolygonCredits);
