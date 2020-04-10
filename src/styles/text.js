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

export const subheader = css`
  ${base2};
  font-size: 22pt;
  line-height: 24pt;
  ${tablet(`
    font-size: 20pt;
    line-height: 22pt;
  `)}
  ${mobile(`
    font-size: 18pt;
    line-height: 20pt;
  `)}
`;

export const subheader2 = css`
  ${subheader};
  color: ${getStyle('text2')};
`;

export const detail = css`
  ${base2};
  font-size: 12pt;
  ${mobile(`
    font-size: 11pt;
  `)}
`;

export const detail2 = css`
  ${detail};
  color: ${getStyle('text2')};
`;

export const detail3 = css`
  ${detail};
  font-size: 12px;
  color: ${getStyle('text5')};
`;

export const detail4 = css`
  ${base2};
  color: ${getStyle('text2')};
  font-size: 14px;
  font-weight: light;
`;
