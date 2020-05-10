const withSvgr = require('next-svgr');

module.exports = withSvgr({
  webpack(config) {
    config.resolve.modules.push(__dirname, '.');
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
