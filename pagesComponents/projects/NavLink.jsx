import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import PropTypes from 'prop-types';
import CaretRightIcon from 'public/icons/caret-right.svg';
import { getBool, getStyle } from 'styles/utils';
import { mobile } from 'styles/breakpoints';
import { Body2, Detail3 } from 'components/text';
import { Centered } from 'components/layout';

const Container = styled.a`
  display: grid;
  grid-column-gap: 32px;
  ${mobile(`
      grid-column-gap: 16px;
    `)};
  ${Detail3} {
    align-self: end;
    justify-self: end;
  }
  ${Body2}, ${Detail3} {
    opacity: 0.82;
  }
  ${getBool(
    'reverse',
    `
      svg {
        transform: scaleX(-1);
        margin-right: 2px;
      }
      ${Detail3} {
        justify-self: start;
      }
      grid-template-areas: 'icon detail3' 'icon body2';
    `,
    `
    grid-template-areas: 'detail3 icon' 'body2 icon';
  `,
  )};
  ${Centered} {
    position: relative;
    height: 64px;
    width: 64px;
    border-radius: 50%;
    border: ${getStyle('ctaBorder2')};
    transition: ${getStyle('linearHue')};
    > svg {
      width: 8px;
      color: ${getStyle('text2')};
    }
    ${mobile(`
      height: 48px;
      width: 48px;
      > svg {
      width: 6px;
    }
    `)};
    ::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      height: 0;
      width: 0;
      margin-left: 0;
      margin-top: 0;
      border-radius: 50%;
      transition: ${getStyle('easeOutSize')};
      background: ${getStyle('ctaBackground3')};
    }
  }
  &:hover {
    ${Body2}, ${Detail3} {
      opacity: 1;
    }
    ${Centered} {
      ::after {
        height: 80%;
        width: 80%;
        margin-left: -40%;
        margin-top: -40%;
      }
    }
  }
  &:active {
    ${Centered} {
      ::after {
        height: 90%;
        width: 90%;
        margin-left: -45%;
        margin-top: -45%;
      }
    }
  }
`;

const NavLink = ({ as, title, reverse, href, ...props }) => (
  <Link as={as} href={href} passHref>
    <Container reverse={reverse} {...props}>
      <Centered ga="icon">
        <CaretRightIcon />
      </Centered>
      <Detail3>{reverse ? 'PREV' : 'NEXT'}</Detail3>
      <Body2>{title}</Body2>
    </Container>
  </Link>
);

NavLink.propTypes = {
  as: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  reverse: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

NavLink.defaultProps = {
  reverse: false,
};

export default NavLink;
