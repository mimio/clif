import React from 'react';
import { css } from '@emotion/core';

const sidePanelCss = open => css`
  width: 300px;
  height: 100%;
  background: white;
  position: absolute;
  top: 0;
  left: 0;
  transform: ${open ? 'translateX(0px)' : 'translateX(-1000px)'};
  transition: transform 0.5s ease-in;
  z-index: 10;
`;

export default function SidePanel() {
  return <div css={sidePanelCss(false)} />;
}
