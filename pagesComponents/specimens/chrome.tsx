import type { Specimen } from 'pagesComponents/specimens/types';

// Placeholder slot. The owning lane replaces this file wholesale; the entry in
// pages/specimens.tsx is pre-registered so no two lanes edit that shared file.
export const chrome: Specimen = {
  id: 'chrome',
  title: 'Chrome',
  note: 'Altimeter, theme eye, contact mouth, coordinate pill.',
  render: () => <p>Not implemented yet.</p>,
};

export default chrome;
