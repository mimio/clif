import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { getBool, getStyle, size } from 'styles';
import { detail } from 'styles/text';
import { centered } from 'styles/layout';
import { HELLO, WORK, PROJECTS, orderedTabs } from 'constants/pages';
import { HomeIcon } from 'icons';
import { Column } from './layout';

const StyledHomeIcon = styled(HomeIcon)`
  height: 20px;
  width: 20px;
`;

const StyledLink = styled.a`
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

const copy = {
  [HELLO]: <StyledHomeIcon />,
  [PROJECTS]: 'Projects',
  [WORK]: 'History',
};

const Navigation = ({ className }) => {
  const { pathname } = useRouter();
  return (
    <Column className={className} sp={4}>
      {orderedTabs.map(({ id, path }) => {
        return (
          <Link href={path} as={path} passHref key={id}>
            <StyledLink
              ariaLabel={`Link To Page ${path}`}
              className={id}
              isActive={
                path === '/'
                  ? pathname === path
                  : pathname.includes(path)
              }
            >
              {copy[id]}
            </StyledLink>
          </Link>
        );
      })}
    </Column>
  );
};

Navigation.propTypes = {
  className: PropTypes.string,
};

Navigation.defaultProps = {
  className: '',
};

export default Navigation;
