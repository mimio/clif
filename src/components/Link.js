import React from 'react';
import PropTypes from 'prop-types';
import { ChildrenPropType } from 'utils/prop-types';
import { getBool, getStyle, size } from 'styles';
import { detail2 } from 'styles/text';
import { centered } from 'styles/layout';
import styled from '@emotion/styled';

const StyledLink = styled.a`
  ${centered};
  border: ${getStyle('ctaBorder')};
  ${getBool(
    'vertical',
    `
    writing-mode: vertical-lr;
    width: ${size(8)};
    padding: ${size(3)} 0;
    svg {
      transform: rotate(90deg);
      margin-bottom: ${size(3)};
    }
  `,
    `
    height: ${size(8)};
    padding: 0 ${size(3)};
    svg {
      margin-right: ${size(3)};
    }
  `,
  )};
  border-radius: ${size(4)};
  ${detail2};
  svg {
    width: ${size(4)};
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

const Link = ({ children, className, href, Icon, vertical }) => (
  <StyledLink
    className={className}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    vertical={vertical}
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
  vertical: PropTypes.bool,
};

Link.defaultProps = {
  vertical: false,
};

export default Link;
