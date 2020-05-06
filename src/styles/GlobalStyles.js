import React from 'react';
import { Global, css } from '@emotion/core';
import colors from './theme/colors';
import transitions from './theme/transitions';

const globalCss = css`
  html {
    box-sizing: border-box;
  }
  *,
  *:before,
  *:after {
    box-sizing: inherit;
    cursor: none !important;
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
  #root {
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
`;

export default function GlobalStyles() {
  return <Global styles={globalCss} />;
}
