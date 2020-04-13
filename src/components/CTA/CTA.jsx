import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { ChildrenPropType } from 'utils/prop-types';
import { getBool, getStyle, size } from 'styles';
import { detail2 } from 'styles/text';
import { centered } from 'styles/layout';
import styled from '@emotion/styled';

const StyledLink = styled.a`
  ${centered};
  border: ${getStyle('ctaBorder')};
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
    svg {
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

const StyledInternalLink = StyledLink.withComponent(RouterLink);

const StyledButton = StyledLink.withComponent('button');

const Link = ({
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
  let Container = StyledButton;
  let props = {};
  if (isLink) {
    Container = internal ? StyledInternalLink : StyledLink;
    props = internal
      ? { to: href }
      : {
          href,
          target: '_blank',
          rel: 'noopener noreferrer',
        };
  }
  return (
    <Container
      className={className}
      vertical={vertical}
      onClick={onClick}
      disabled={disabled}
      hasChildren={!!children}
      {...props}
    >
      <Icon />
      {children}
    </Container>
  );
};

Link.propTypes = {
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
