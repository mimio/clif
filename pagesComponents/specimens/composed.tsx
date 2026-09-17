import type { Specimen } from 'pagesComponents/specimens/types';

// Placeholder slot. The owning lane replaces this file wholesale; the entry in
// pages/specimens.tsx is pre-registered so no two lanes edit that shared file.
export const composed: Specimen = {
  id: 'composed',
  title: 'Composed',
  note: 'Project table, sheet, scrubber, pager, meta grid, screenshot plane.',
  render: () => <p>Not implemented yet.</p>,
};

export default composed;
