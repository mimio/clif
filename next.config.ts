import type { NextConfig } from 'next';

/*
 * The specimens harness is a development tool, and this is what keeps it out
 * of the site rather than merely unreachable on it.
 *
 * getStaticProps returning `notFound` stops the page being *served*. It does
 * not stop the module being compiled, bundled and deployed: an A/B build
 * measured 131,623 bytes of client chunks that exist only because
 * pages/specimens.* is under pages/, `.next/server/pages/specimens.js` on
 * disk, and a /specimens entry in the _buildManifest every visitor
 * downloads. Worse than the bytes, the harness imports every layer, which
 * made a dev board a second production consumer of scene/.
 *
 * Gating the import behind the inlined env literal does not help either --
 * measured, the dynamic() form left the chunk in place and the bundle a few
 * KB larger. Next decides what a page is from the filename, so the fix has
 * to be the filename.
 *
 * So every real page is <name>.page.tsx, the harness is
 * specimens.harness.tsx, and `harness.tsx` only joins pageExtensions when
 * NEXT_PUBLIC_SPECIMENS is set. With the flag off Next does not see the file
 * at all: no route, no chunk, no manifest entry. The file keeps its .tsx
 * extension either way, so TypeScript and ESLint still check it.
 */
const specimensEnabled = process.env.NEXT_PUBLIC_SPECIMENS === '1';

const PAGE_EXTENSIONS = ['page.tsx', 'page.ts'];
const HARNESS_EXTENSIONS = ['harness.tsx'];

const nextConfig: NextConfig = {
  pageExtensions: specimensEnabled
    ? [...PAGE_EXTENSIONS, ...HARNESS_EXTENSIONS]
    : PAGE_EXTENSIONS,

  images: {
    // Images are referenced by URL, never imported, so Next's static-image
    // module typings are not needed and would shadow the SVG-as-component
    // declaration in types/assets.d.ts.
    disableStaticImages: true,
  },
  // /history is gone; the work timeline lives on /about now. 308 so the
  // redirect is cached and the method is preserved.
  async redirects() {
    return [
      { source: '/history', destination: '/about', permanent: true },
    ];
  },
  turbopack: {
    rules: {
      // SVG files import as React components.
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
      // GLSL shaders import as strings, with glslify pragmas resolved.
      '*.glsl': {
        loaders: ['raw-loader', 'glslify-loader'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
