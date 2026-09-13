import type {
  ComponentType,
  MouseEventHandler,
  ReactNode,
  SVGProps,
} from 'react';
import NextLink from 'next/link';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { getBool, getStyle } from 'styles/utils';
import { size } from 'styles/size';
import { detail2 } from 'styles/text';
import { centered } from 'styles/layout';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type StyleProps = {
  disabled?: boolean;
  'data-vertical'?: boolean;
  'data-has-children'?: boolean;
};

// Shared by the link, external link and button variants below. A function of
// props because the getBool() fragments depend on them.
const buttonStyles = (props: object) => css`
  ${centered(props)};
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
  )(props)};
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
  )(props)}
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
  )(props)}
`;

const StyledNextLink = styled(NextLink)<StyleProps>`
  ${buttonStyles};
`;

const StyledLink = styled.a<StyleProps>`
  ${buttonStyles};
`;

const StyledButton = styled.button<StyleProps>`
  ${buttonStyles};
`;

export type ButtonProps = {
  ariaLabel: string;
  Icon: IconComponent;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  /** Route within this site (rendered with next/link) rather than an external URL. */
  internal?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  vertical?: boolean;
};

const Button = ({
  ariaLabel,
  Icon,
  children = null,
  className = '',
  disabled = false,
  href,
  internal = false,
  onClick,
  vertical = false,
}: ButtonProps) => {
  const shared = {
    className,
    onClick,
    disabled,
    'data-vertical': vertical,
    'data-has-children': Boolean(children),
    'aria-label': ariaLabel,
  };
  const meat = (
    <>
      <Icon />
      {children}
    </>
  );
  if (href && internal) {
    return (
      <StyledNextLink href={href} {...shared}>
        {meat}
      </StyledNextLink>
    );
  }
  if (href) {
    return (
      <StyledLink
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...shared}
      >
        {meat}
      </StyledLink>
    );
  }
  return (
    <StyledButton type="button" {...shared}>
      {meat}
    </StyledButton>
  );
};

export default Button;
