import styled from '@emotion/styled';
import {
  centered,
  full,
  row,
  column,
  type LayoutProps,
} from 'styles/layout';

export type { LayoutProps };

export const Full = styled.div`
  ${full};
`;

export const Centered = styled.div<LayoutProps>`
  ${centered};
`;

export const Row = styled.div<LayoutProps>`
  ${row};
`;

export const Column = styled.div<LayoutProps>`
  ${column};
`;
