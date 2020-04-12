import { css } from '@emotion/core';
import { getStyle } from './utils';
import { tablet, mobile } from './breakpoints';

const base = css`
  transition: ${getStyle('linearHue')};
`;

export const heading = css`
  ${base};
  font-family: 'Fat';
  color: ${getStyle('text2')};
  font-size: 84pt;
  ${tablet(`font-size: 64pt;`)}
  ${mobile(`font-size: 40pt;`)}
`;

const base2 = css`
  ${base};
  font-family: 'Roboto Mono';
  color: ${getStyle('text1')};
`;

export const heading2 = css`
  ${base2};
  color: ${getStyle('text1')};
  font-size: 36px;
  ${tablet(`font-size: 32px;`)};
  ${mobile(`font-size: 22px;`)};
`;

export const subheader = css`
  ${base2};
  font-size: 22pt;
  line-height: 24pt;
  ${tablet(`
    font-size: 20pt;
    line-height: 22pt;
  `)};
  ${mobile(`
    font-size: 18pt;
    line-height: 20pt;
  `)};
`;

export const subheader2 = css`
  ${subheader};
  color: ${getStyle('text2')};
`;

export const detail = css`
  ${base2};
  font-size: 14px;
  ${mobile(`
    font-size: 12px;
  `)};
`;

export const detail2 = css`
  ${detail};
  color: ${getStyle('text2')};
`;

export const detail3 = css`
  ${detail};
  color: ${getStyle('text1c')};
`;

export const body = css`
  ${base2};
  color: ${getStyle('text1b')};
  font-size: 18px;
  ${mobile(`
    font-size: 14px;
  `)};
`;

export const body2 = css`
  ${body};
  color: ${getStyle('text2')};
`;
