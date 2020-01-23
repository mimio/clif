import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { TabPropType } from 'utils/prop-types';
import { getStyle, size } from 'styles';
import { centered } from 'styles/layout';
import { HELLO, WORK, PROJECTS, orderedTabs } from 'constants/tabs';
import { HomeIcon } from 'icons';
import { ItemRow } from '../layout';
import { Detail } from '../Text';

const copy = {
  [HELLO]: <HomeIcon />,
  [PROJECTS]: 'Projects',
  [WORK]: 'Work',
};

const StyledLink = styled(Link)`
  position: relative;
  ${centered};
  height: ${size(15)};
  width: ${size(30)};
  ${Detail} {
    color: ${({ active }) =>
      active ? getStyle('text1') : getStyle('text2')};
    transition: ${getStyle('linearHue')};
  }
  &:hover {
    ${Detail} {
      color: ${({ active }) =>
        active ? getStyle('text1') : getStyle('text3')};
    }
  }
`;

const Container = styled(ItemRow)`
  position: relative;
  > a:not(a:last-child) {
    margin-right: ${size(8)};
  }
`;

const Navigation = ({ className, selectedTab }) => (
  <Container className={className}>
    {orderedTabs.map(tab => (
      <StyledLink
        active={tab === selectedTab}
        to={`/${tab}`}
        key={tab}
      >
        <Detail>{copy[tab]}</Detail>
      </StyledLink>
    ))}
  </Container>
);

Navigation.propTypes = {
  className: PropTypes.string,
  selectedTab: TabPropType,
};

Navigation.defaultProps = {
  className: '',
  selectedTab: null,
};

export default Navigation;
