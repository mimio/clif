import { css } from '@emotion/core';
import { getStyle } from 'styles';

const base = css`
  transition: ${getStyle('linearHue')};
`;

export const heading = css`
  ${base};
  font-family: 'Fat';
  color: ${getStyle('text2')};
  font-size: 84pt;
`;

const base2 = css`
  ${base};
  font-family: 'Andale Mono';
  color: ${getStyle('text1')};
`;

export const subheader = css`
  ${base2};
  font-size: 22pt;
`;

export const detail = css`
  ${base2};
  font-size: 14pt;
`;

export const detail2 = css`
  ${base2};
  color: ${getStyle('text1')};
`;
