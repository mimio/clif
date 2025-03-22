import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { getBool, getStyle } from 'styles/utils';
import { size } from 'styles/size';
import { detail } from 'styles/text';
import { centered } from 'styles/layout';
import { HELLO, WORK, PROJECTS, orderedTabs } from 'constants/pages';
import HomeIcon from 'public/icons/home.svg';
import { Column } from './layout';

const StyledHomeIcon = styled(HomeIcon)`
  height: 20px;
  width: 20px;
`;

const UL = Column.withComponent('ul');

const StyledLink = styled(Link)`
  ${centered};
  ${detail};
  font-weight: 300;
  position: relative;
  writing-mode: vertical-lr;
  z-index: 1;
  width: ${size(6)};
  padding: ${size(2)} 0;
  ${StyledHomeIcon} {
    color: ${getStyle('text1')};
  }
  ${getBool(
    'aria-selected',
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
    width: ${(props) => (props['aria-selected'] ? '100%' : 0)};
    transition: ${getStyle('easeOutSize')};
    background: ${getStyle('ctaBackground1')};
    z-index: -1;
  }
`;

const copy = {
  [HELLO]: <StyledHomeIcon />,
  [PROJECTS]: 'Projects',
  [WORK]: 'History',
};

const Navigation = ({ className = '' }) => {
  const { pathname } = useRouter();
  return (
    <nav className={className}>
      <UL aria-label="navigation" role="menubar" sp={4}>
        {orderedTabs.map(({ id, path }) => {
          const isTabActive =
            path === '/'
              ? pathname === path
              : pathname.includes(path);
          return (
            <li key={id}>
              <StyledLink
                href={path}
                passHref
                aria-label={`Link To Page ${path}`}
                className={id}
                aria-selected={isTabActive}
                role="menuitem"
              >
                {copy[id]}
              </StyledLink>
            </li>
          );
        })}
      </UL>
    </nav>
  );
};

Navigation.propTypes = {
  className: PropTypes.string,
};

export default Navigation;
