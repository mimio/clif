import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Images are referenced by URL, never imported, so Next's static-image
    // module typings are not needed and would shadow the SVG-as-component
    // declaration in types/assets.d.ts.
    disableStaticImages: true,
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
