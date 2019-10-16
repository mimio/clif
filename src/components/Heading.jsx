import React from 'react';
import { css } from '@emotion/core';

const headingCss = (level = 1) => css`
  font-size: ${24 / level}px;
`;

export default function Heading({ level = 1, children, className }) {
  const El = `h${level}`;
  return (
    <El className={className} css={headingCss(level)}>
      {children}
    </El>
  );
}
