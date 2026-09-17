import localFont from 'next/font/local';

/*
 * The two faces, loaded by next/font/local.
 *
 * Each one exposes a CSS variable; pages/_app.tsx puts the variable
 * classes on the app wrapper (a display: contents element inside #__next)
 * and styles/tokens/fonts.css builds --family-mono and --family-display
 * around them. That indirection is why globals.css must map Tailwind's
 * --font-* namespace with `@theme inline`: the variables are on that
 * wrapper, not on :root.
 *
 * Both faces declare a `fallback` stack. next/font emits it into the
 * generated @font-face's own family list, so if a face is ever pulled the
 * text reflows into the next family instead of the declaration going
 * invalid -- see the Adder note below, and the matching var() fallbacks in
 * tokens/fonts.css.
 */

// Roboto Mono Light, SIL Open Font License 1.1 (see fonts/LICENSE-roboto-mono.txt).
// The site has always rendered every Roboto Mono weight with the Light cut,
// so this one file covers the 200-400 range the text styles ask for and
// heavier weights synthesize from it, exactly as before.
export const robotoMono = localFont({
  src: './fonts/roboto-mono-latin-300-normal.woff2',
  weight: '200 400',
  style: 'normal',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
  variable: '--font-roboto-mono',
});

// Adder Super-Extended, the display face: the page word IS the logo, so
// this is the one piece of brand there is.
//
// REDISTRIBUTION RIGHTS ARE UNCONFIRMED -- there is no license file for
// this binary anywhere in the repo or the design bundle, unlike Roboto
// Mono. fonts/LICENSE-adder.md records what is and is not known. The
// fallback stack is deliberately a display-ish one rather than the mono
// stack, so that if the file has to come out the page word degrades to
// something wide and heavy rather than breaking the layout.
export const adder = localFont({
  src: './fonts/adder-superextended.woff2',
  weight: '700',
  style: 'normal',
  display: 'swap',
  fallback: ['Silkscreen', 'Impact', 'Haettenschweiler', 'monospace'],
  variable: '--font-adder',
});
