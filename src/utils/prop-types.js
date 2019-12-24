import PropTypes from 'prop-types';
import { orderedTabs } from 'constants/tabs';

export const TabPropType = PropTypes.oneOf(orderedTabs);

export const ChildrenPropType = PropTypes.oneOfType([
  PropTypes.node,
  PropTypes.arrayOf(PropTypes.node),
  PropTypes.func,
  PropTypes.object,
]);
