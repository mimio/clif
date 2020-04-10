import React from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { getBool, getStyle, size } from 'styles';
import { detail } from 'styles/text';
import { centered } from 'styles/layout';
import { HELLO, WORK, PROJECTS, orderedTabs } from 'constants/tabs';
import { HomeIcon } from 'icons';
import { Column } from '../layout';

const StyledHomeIcon = styled(HomeIcon)`
  height: 20px;
  width: 20px;
`;

const StyledLink = styled(Link)`
  ${centered};
  ${detail};
  position: relative;
  writing-mode: vertical-lr;
  z-index: 1;
  width: ${size(6)};
  padding: ${size(2)} 0;
  ${StyledHomeIcon} {
    color: ${getStyle('text1')};
  }
  ${getBool(
    'isActive',
    `
      color: ${getStyle('text3')};
      ${StyledHomeIcon} {
        color: ${getStyle('text2')};
      }
    `,
    `
      &:not(.${HELLO}):hover::after {
        width: 20%;
      }
      &:not(.${HELLO}):active::after {
        width: 12%;
      }
      &.${HELLO}:hover {
        opacity: 0.9;
      }
      &.${HELLO}:active {
        opacity: 0.8;
      }
  `,
  )};
  &:not(.${HELLO}) ::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ isActive }) => (isActive ? '100%' : 0)};
    transition: ${getStyle('easeOutSize')};
    background: ${getStyle('ctaBackground1')};
    z-index: -1;
  }
`;

const Container = styled(Column)`
  position: relative;
`;

const copy = {
  [HELLO]: <StyledHomeIcon />,
  [PROJECTS]: 'Projects',
  [WORK]: 'Work',
};

const Navigation = ({ className }) => {
  const { tabId } = useParams();
  return (
    <Container className={className} sp={4}>
      {orderedTabs.map(tab => (
        <StyledLink
          className={tab}
          isActive={tab === tabId}
          to={`/${tab}`}
          key={tab}
        >
          {copy[tab]}
        </StyledLink>
      ))}
    </Container>
  );
};

Navigation.propTypes = {
  className: PropTypes.string,
};

Navigation.defaultProps = {
  className: '',
};

export default Navigation;
