import type { Specimen } from 'pagesComponents/specimens/types';

// Placeholder slot. The owning lane replaces this file wholesale; the entry in
// pages/specimens.tsx is pre-registered so no two lanes edit that shared file.
export const buttons: Specimen = {
  id: 'buttons',
  title: 'Buttons',
  note: 'Keycap and flat variants across sizes, tones and states.',
  render: () => <p>Not implemented yet.</p>,
};

export default buttons;
