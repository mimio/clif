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

const Link = ({
  children,
  className,
  href,
  Icon,
  vertical,
  isLink,
  onClick,
}) => {
  const props = isLink
    ? {
        href,
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    : {};
  return (
    <StyledLink
      className={className}
      vertical={vertical}
      onClick={onClick}
      {...props}
    >
      <Icon />
      {children}
    </StyledLink>
  );
};

Link.propTypes = {
  Icon: ChildrenPropType.isRequired,
  children: PropTypes.string.isRequired,
  className: PropTypes.string,
  href: PropTypes.string,
  isLink: PropTypes.bool,
  onClick: PropTypes.func,
  vertical: PropTypes.bool,
};

Link.defaultProps = {
  className: '',
  href: '',
  isLink: false,
  onClick() {},
  vertical: false,
};

export default Link;
