import { css } from '@emotion/core';

const flexClass = `
 display: flex;
 justify-content: start;
 align-items: center;
`;

export const centered = css`
  ${flexClass};
  justify-content: center;
`;

export const row = css`
  ${flexClass};
  flex-direction: row;
`;

export const column = css`
  ${flexClass};
  flex-direction: column;
`;

// sp = "spacing"
export const itemRow = ({ theme: { size }, sp }) => css`
  > *:not(:last-child) {
    margin-right: ${size(sp || 4)};
  }
  ${row};
`;

export const itemColumn = ({ theme: { size }, sp }) => css`
  > *:not(:last-child) {
    margin-bottom: ${size(sp || 4)};
  }
  ${column};
`;
