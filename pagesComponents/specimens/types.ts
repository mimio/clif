import type { ReactNode } from 'react';

/*
 * One lane, one file. A lane adds pagesComponents/specimens/<lane>.tsx and
 * one line to the SECTIONS array in pages/specimens.tsx, so no two lanes
 * ever edit the same specimen file.
 */
export type Specimen = {
  /** Anchor id and index label. Must be unique across lanes. */
  id: string;
  title: string;
  /** One line on what the section is for. */
  note?: string;
  render: () => ReactNode;
};
