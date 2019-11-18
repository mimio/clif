import React from 'react';
import { Global, css } from '@emotion/core';

import colors from './colors';

const globalCss = css`
  html {
    box-sizing: border-box;
  }
  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  html,
  body,
  #root {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
  }
  * {
    ::-webkit-scrollbar {
      height: 20px;
      width: 20px;
      background-color: rgba(255, 255, 255, 0);
    }

    ::-webkit-scrollbar-track,
    ::-webkit-scrollbar-thumb {
      border: 8px solid rgba(255, 255, 255, 0);
      border-radius: 10px;
      background-clip: padding-box;
    }

    ::-webkit-scrollbar-track {
      background-color: rgba(255, 255, 255, 0);
    }

    ::-webkit-scrollbar-thumb {
      background-color: ${colors.limeGreen};
      &:hover {
        background-color: ${colors.darkLimeGreen};
      }
      &:active {
        background-color: ${colors.darkLimeGreen};
      }
    }
  }
`;

export default function GlobalStyles() {
  return <Global styles={globalCss} />;
}
