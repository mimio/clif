import { Global, css } from '@emotion/core';

const globalCss = css`
  html,
  body,
  #root {
    height: 100%;
    width: 100%;
    position: relative;
    background: darkolivegreen;
  }
`;

export default function GlobalStyles() {
  return <Global styles={globalCss} />;
}
