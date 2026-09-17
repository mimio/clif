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

// jsdom does not implement matchMedia, and scene/budget.ts reads the
// reduced-motion preference through it. The stub reports "no preference",
// which is the branch the scene's animation loop runs.
vi.stubGlobal(
  'matchMedia',
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
);
