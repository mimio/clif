import type { Specimen } from 'pagesComponents/specimens/types';

// Placeholder slot. The owning lane replaces this file wholesale; the entry in
// pages/specimens.tsx is pre-registered so no two lanes edit that shared file.
export const atoms: Specimen = {
  id: 'atoms',
  title: 'Atoms',
  note: 'Text scale, page word, icons, pills, chips, rules.',
  render: () => <p>Not implemented yet.</p>,
};

export default atoms;
