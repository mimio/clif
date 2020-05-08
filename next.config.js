const withSvgr = require('next-svgr');
const aliases = require('./alias-config');

module.exports = withSvgr({
  webpack(config) {
    const { alias } = config.resolve;
    config.resolve.alias = {
      ...alias,
      ...aliases,
    };
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    });
    config.node = {
      ...config.node,
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
    };
    return config;
  },
});
