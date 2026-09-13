/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Emotion's css prop and labels via SWC; jsxImportSource lives in
    // jsconfig.json.
    emotion: true,
  },
  turbopack: {
    rules: {
      // SVG files import as React components (was next-plugin-svgr).
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

module.exports = nextConfig;
