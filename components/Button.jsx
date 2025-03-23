import React from 'react';
import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { ChildrenPropType } from 'utils/prop-types';
import { getBool, getStyle } from 'styles/utils';
import { size } from 'styles/size';
import { detail2 } from 'styles/text';
import { centered } from 'styles/layout';
import styled from '@emotion/styled';

const StyledNextLink = styled(NextLink)`
  ${centered};
  border: ${getStyle('ctaBorder2')};
  cursor: pointer;
  background: transparent;
  svg {
    color: inherit;
  }
  ${getBool(
    'data-vertical',
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
  ${getBool(
    'data-has-children',
    '',
    `
    padding: 0;
    width: ${size(8)};
    svg {
      height: 12px;
      margin-right: 0;
      margin-bottom: 0;
    }
  `,
  )}
  &:hover,
  &:active,
  &:focus {
    color: ${getStyle('text3')};
    background: ${getStyle('ctaBackground1')};
  }
  &:active {
    opacity: 0.7 !important;
  }
  ${getBool(
    'disabled',
    `
    opacity: 0.5;
    pointer-events: none;
  `,
  )}
`;

const StyledLink = StyledNextLink.withComponent('a');

const StyledButton = StyledNextLink.withComponent('button');

const Button = ({
  ariaLabel = '',
  Icon,
  children = null,
  className = '',
  disabled = false,
  href,
  internal = false,
  onClick = () => {},
  vertical = false,
}) => {
  const isLink = !!href;
  const props = {
    className,
    onClick,
    disabled,
    'data-vertical': vertical,
    'data-has-children': !!children,
    'aria-label': ariaLabel,
  };
  const meat = (
    <>
      <Icon />
      {children}
    </>
  );
  if (isLink && internal) {
    return (
      <StyledNextLink href={href} passHref {...props}>
        {meat}
      </StyledNextLink>
    );
  }
  if (isLink) {
    return (
      <StyledLink
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {meat}
      </StyledLink>
    );
  }
  return <StyledButton {...props}>{meat}</StyledButton>;
};

Button.propTypes = {
  ariaLabel: PropTypes.string.isRequired,
  Icon: ChildrenPropType.isRequired,
  children: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  href: PropTypes.string,
  internal: PropTypes.bool,
  isLink: PropTypes.bool,
  onClick: PropTypes.func,
  vertical: PropTypes.bool,
};

export default Button;
