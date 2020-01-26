import React from 'react';
import PropTypes from 'prop-types';
import { ChildrenPropType } from 'utils/prop-types';
import { getStyle, size } from 'styles';
import { detail2 } from 'styles/text';
import { itemRow } from 'styles/layout';
import styled from '@emotion/styled';

const StyledLink = styled.a`
  ${itemRow};
  border: ${getStyle('ctaBorder')};
  height: ${size(8)};
  padding: 0 ${size(3)};
  border-radius: ${size(4)};
  text-transform: uppercase;
  ${detail2};
  svg {
    width: ${size(4)};
    margin-right: ${size(2)};
  }
  &:hover,
  &:active,
  &:focus {
    color: ${getStyle('text3')};
    background: ${getStyle('ctaBackground1')};
  }
  &:active {
    opacity: 0.7 !important;
  }
`;

const Link = ({ children, className, href, Icon }) => (
  <StyledLink
    className={className}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
  >
    <Icon />
    {children}
  </StyledLink>
);

Link.propTypes = {
  children: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  Icon: ChildrenPropType.isRequired,
};

export default Link;
