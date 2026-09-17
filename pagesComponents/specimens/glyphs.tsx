import type { Specimen } from 'pagesComponents/specimens/types';

// Placeholder slot. The owning lane replaces this file wholesale; the entry in
// pages/specimens.tsx is pre-registered so no two lanes edit that shared file.
export const glyphs: Specimen = {
  id: 'glyphs',
  title: 'Glyphs',
  note: 'The house, brain and book, at rest and hovered.',
  render: () => <p>Not implemented yet.</p>,
};

export default glyphs;
