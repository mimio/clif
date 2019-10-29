import React from 'react';
import { Global, css } from '@emotion/core';

const globalCss = css`
  html,
  body,
  #root {
    height: 100%;
    width: 100%;
    position: relative;
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
      background-color: rgba(0, 0, 0, 0.4);
      &:hover {
        background-color: rgba(60, 60, 60, 0.2);
      }
      &:active {
        background-color: rgba(60, 60, 60, 0.3);
      }
    }
  }
`;

export default function GlobalStyles() {
  return <Global styles={globalCss} />;
}
