const withSvgr = require('next-plugin-svgr');

module.exports = withSvgr({
  webpack(config) {
    config.resolve.modules.push(__dirname, '.');
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    });
    return config;
  },
});
