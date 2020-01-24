import React from 'react';
import { Global, css } from '@emotion/core';

const globalCss = css`
  html {
    box-sizing: border-box;
  }
  *,
  *:before,
  *:after {
    box-sizing: inherit;
    /* cursor: none !important; */
  }

  html,
  body,
  #root {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
  }
  ul {
    padding: 0;
    margin-right: 0;
  }
  a {
    text-decoration: none;
  }
`;

export default function GlobalStyles() {
  return <Global styles={globalCss} />;
}
