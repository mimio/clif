import React from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { HELLO, WORK, PROJECTS } from 'constants/tabs';
import { Heading } from './Text';

const copy = {
  [HELLO]: 'Hello,',
  [PROJECTS]: 'PROJECTS',
  [WORK]: 'WORK HISTORY',
};

// splay headers out simultaneously and animate directly

const Header = ({ className }) => {
  const { tabId } = useParams();
  return <Heading className={className}>{copy[tabId]}</Heading>;
};

Header.propTypes = {
  className: PropTypes.string,
};

Header.defaultProps = {
  className: '',
};

export default Header;
