import type { Specimen } from 'pagesComponents/specimens/types';

// Placeholder slot. The owning lane replaces this file wholesale; the entry in
// pages/specimens.tsx is pre-registered so no two lanes edit that shared file.
export const scene: Specimen = {
  id: 'scene',
  title: 'Scene',
  note: 'Camera table, fog presets and the generated LUT strip.',
  render: () => <p>Not implemented yet.</p>,
};

export default scene;
