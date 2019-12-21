import React from 'react';
import { Link } from 'react-router-dom';
import { TabPropType } from 'utils/prop-types';
import { HELLO, WORK, CONTACT, orderedTabs } from 'constants/tabs';
import { ItemRow } from './layout';
import { Navigation as NavigationText } from './Text';

const copy = {
  [HELLO]: 'hello',
  [WORK]: 'work',
  [CONTACT]: 'say hi',
};

const Navigation = ({ selectedTab }) => (
  <ItemRow sp={8}>
    {orderedTabs.map(tab => (
      <Link to={`/${tab}`} key={tab}>
        <NavigationText active={tab === selectedTab}>
          {copy[tab]}
        </NavigationText>
      </Link>
    ))}
  </ItemRow>
);

Navigation.propTypes = {
  selectedTab: TabPropType,
};

Navigation.defaultProps = {
  selectedTab: null,
};

export default Navigation;
