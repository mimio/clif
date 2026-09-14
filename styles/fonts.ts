import localFont from 'next/font/local';

// Roboto Mono Light, SIL Open Font License 1.1 (see fonts/LICENSE-roboto-mono.txt).
// The site has always rendered every Roboto Mono weight with the Light cut,
// so this one file covers the 200-400 range the text styles ask for and
// heavier weights synthesize from it, exactly as before.
export const robotoMono = localFont({
  src: './fonts/roboto-mono-latin-300-normal.woff2',
  weight: '200 400',
  style: 'normal',
  display: 'swap',
});

export const adder = localFont({
  src: './fonts/adder-superextended.woff2',
  weight: '700',
  style: 'normal',
  display: 'swap',
});
