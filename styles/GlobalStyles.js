import React from 'react';
import { Global, css } from '@emotion/core';
import colors from './theme/colors';
import transitions from './theme/transitions';

const fontOptimizations = `
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
    U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122,
    U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
`;

const robotoMono = `
  font-family: 'Roboto Mono';
  src: local('Roboto Mono Light'), local('RobotoMono-Light'),
      url(https://fonts.gstatic.com/s/robotomono/v7/L0xkDF4xlVMF-BfR8bXMIjDgiWqxf7-pAVU_.woff2)
        format('woff2');
`;

const globalCss = css`
  html {
    box-sizing: border-box;
  }
  *,
  *:before,
  *:after {
    box-sizing: inherit;
    -webkit-overflow-scrolling: touch;
  }
  * {
    ::-webkit-scrollbar {
      height: 12px;
      width: 12px;
      background-color: rgba(255, 255, 255, 0);
    }

    ::-webkit-scrollbar-track,
    ::-webkit-scrollbar-thumb {
      border: 4px solid rgba(255, 255, 255, 0);
      border-radius: 10px;
      background-clip: padding-box;
    }

    ::-webkit-scrollbar-track {
      background-color: rgba(255, 255, 255, 0);
    }

    ::-webkit-scrollbar-thumb {
      transition: ${transitions.linearHue};
      background-color: ${colors.scroll1};
      &:hover {
        background-color: ${colors.scroll2};
      }
      &:active {
        background-color: ${colors.scroll3};
      }
    }
  }

  html,
  body,
  #__next {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
  }
  body {
    background: ${colors.background1};
  }
  ul {
    padding: 0;
    margin-right: 0;
    list-style-type: none;
  }
  a {
    text-decoration: none;
  }
  button,
  a {
    * {
      user-select: none;
    }
  }
  svg {
    fill: currentColor;
  }
  @font-face {
    ${robotoMono};
    font-style: light;
    font-weight: 200;
    ${fontOptimizations}
  }
  @font-face {
    ${robotoMono};
    font-style: normal;
    font-weight: 300;
    ${fontOptimizations}
  }
  @font-face {
    ${robotoMono};
    font-style: bold;
    font-weight: 400;
    ${fontOptimizations}
  }
  @font-face {
    font-family: 'Adder';
    font-style: bold;
    font-weight: 700;
    src: url('/adder-superextended.woff2') format('woff2');
    ${fontOptimizations};
  }
`;

export default function GlobalStyles() {
  return <Global styles={globalCss} />;
}
