import { css } from '@emotion/core';
import { getStyle } from './utils';
import { tablet, mobile } from './breakpoints';

const base = css`
  transition: ${getStyle('linearHue')};
  font-weight: 300;
`;

const inlineLink = css`
  a {
    background-image: linear-gradient(
      120deg,
      ${getStyle('ctaBackground4')} 0%,
      ${getStyle('ctaBackground4')} 100%
    );
    background-repeat: no-repeat;
    background-size: 100% 1px;
    background-position: 0 100%;
    transition: background-size 0.15s linear;
    color: ${getStyle('text1b')};
    text-decoration: none;
    &:hover {
      background-size: 100% 50%;
      color: ${getStyle('text1')};
    }
    &:active {
      background-size: 100% 30%;
      color: ${getStyle('text1')};
    }
  }
`;

export const heading = css`
  ${base};
  font-family: 'Fat';
  color: ${getStyle('text2')};
  font-size: 84pt;
  ${tablet(`font-size: 64pt;`)};
  ${mobile(`font-size: 40pt;`)};
  overflow: visible;
  margin: 0;
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
  font-weight: regular;
  ${tablet(`font-size: 32px;`)};
  ${mobile(`font-size: 22px;`)};
  margin: 0;
`;

export const heading3 = css`
  ${heading2};
  font-weight: 200;
  margin: 0;
`;

export const subheader = css`
  ${base2};
  ${inlineLink};
  font-size: 22pt;
  line-height: 24pt;
  ${tablet(`
    font-size: 18pt;
    line-height: 22pt;
  `)};
  ${mobile(`
    font-size: 14pt;
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
  line-height: 18px;
  font-weight: 200;
  color: ${getStyle('text1b')};
  ${mobile(`
    font-size: 12px;
    line-height: 16px;
  `)};
`;

export const detail2 = css`
  ${detail};
  font-weight: 300;
  color: ${getStyle('text2')};
`;

export const detail3 = css`
  ${detail};
  font-weight: 300;
  color: ${getStyle('text1c')};
`;

export const body = css`
  ${base2};
  color: ${getStyle('text1b')};
  font-size: 18px;
  line-height: 28px;
  font-weight: 200;
  ${inlineLink};
  p {
    margin: 0;
  }
  > p:not(:last-child) {
    margin-bottom: 1rem;
  }
  ${mobile(`
    font-size: 14px;
    line-height: 22px;
  `)};
`;

export const body2 = css`
  ${body};
  color: ${getStyle('text2')};
  font-weight: 300;
`;
