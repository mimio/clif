import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// styles/fonts.ts calls localFont() at module scope. It is a build-time Next
// construct that throws outside the Next compiler, so anything rendering
// pages/_app.tsx needs it stubbed.
vi.mock('next/font/local', () => ({
  default: () => ({
    className: 'mock-font',
    variable: 'mock-font-variable',
    style: { fontFamily: 'mock-font' },
  }),
}));
