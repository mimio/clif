import { css } from '@emotion/core';
import { size } from 'styles';

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

export const full = css`
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
