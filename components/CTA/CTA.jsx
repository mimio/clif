import React from 'react';
import PropTypes from 'prop-types';
import NextLink from 'next/link';
import styled from '@emotion/styled';
import { ChildrenPropType } from 'utils/prop-types';
import { getBool, getStyle } from 'styles/utils';
import { size } from 'styles/size';
import { detail2 } from 'styles/text';
import { centered } from 'styles/layout';

const StyledLink = styled.a`
  ${centered};
  border: ${getStyle('ctaBorder2')};
  cursor: pointer;
  background: transparent;
  svg {
    color: inherit;
  }
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
  ${getBool(
    'hasChildren',
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

const StyledButton = StyledLink.withComponent('button');

const Link = ({
  ariaLabel,
  Icon,
  children,
  className,
  disabled,
  href,
  internal,
  isLink,
  onClick,
  vertical,
}) => {
  let Meat = StyledButton;
  let meatProps = {
    'aria-label': ariaLabel,
  };
  if (isLink) {
    Meat = StyledLink;
    meatProps = internal
      ? {}
      : {
          href,
          target: '_blank',
          rel: 'noopener noreferrer',
        };
  }
  const meat = (
    <Meat
      className={className}
      vertical={vertical}
      onClick={onClick}
      disabled={disabled}
      hasChildren={!!children}
      {...meatProps}
    >
      <Icon />
      {children}
    </Meat>
  );
  if (isLink && internal)
    return (
      <NextLink href={href} passHref>
        {meat}
      </NextLink>
    );
  return meat;
};

Link.propTypes = {
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

Link.defaultProps = {
  children: null,
  className: '',
  disabled: false,
  href: '',
  internal: false,
  isLink: false,
  onClick() {},
  vertical: false,
};

export default Link;
