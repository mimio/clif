import { css } from '@emotion/core';
import { size } from 'styles';

const flexClass = `
 display: flex;
 justify-content: start;
 align-items: center;
`;

export const centered = `
  ${flexClass};
  justify-content: center;
`;

export const row = `
  ${flexClass};
  flex-direction: row;
`;

export const column = `
  ${flexClass};
  flex-direction: column;
`;

export const full = `
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

// sp = "spacing"
export const itemRow = ({ sp }) => css`
  > *:not(:last-child) {
    margin-right: ${size(sp || 4)};
  }
  ${row};
`;

export const itemColumn = ({ sp }) => css`
  > *:not(:last-child) {
    margin-bottom: ${size(sp || 4)};
  }
  ${column};
`;
