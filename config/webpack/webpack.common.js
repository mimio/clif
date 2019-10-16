const { resolve } = require('path');
const webpack = require('webpack');
const config = require('config');
const path = require('path');
const fs = require('fs');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev =
  (process.env && process.env.NODE_ENV === 'development') ||
  process.env.env === 'dev';

const globals = {
  __DEV__: isDev && !process.env.LINKED_DEV,
  __config__: JSON.stringify(config),
  __MAPBOX_KEY__: JSON.stringify(
    process.env.mapbox_api ||
      'pk.eyJ1IjoidmFpbHZhbGxleWZvdW5kYXRpb24iLCJhIjoiY2ozM2hzNWozMDA2dDMybzl5cHk1aGQzYiJ9.kmGmld5SPo-MqEp34u_vJQ',
  ),
};

const rootDir = resolve(__dirname, '../../');

// no entry specified - only things that would be the same between each app
module.exports = {
  target: 'web',
  entry: { main: resolve(rootDir, 'src', 'index.jsx') },
  output: {
    filename: isDev ? 'bundle.js' : '[name].[contenthash:8].js',
    chunkFilename: isDev
      ? '[name].chunk.js'
      : '[name].[contenthash:8].chunk.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        include: path.resolve(rootDir, 'src'),
        use: {
          loader: 'babel-loader',
          options: JSON.parse(
            fs.readFileSync(path.resolve(rootDir, '.babelrc')),
          ),
        },
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        sideEffects: true,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
            },
          },
          'css-loader',
        ],
      },
      {
        test: /\.(gif|jpg|jpeg|png|svg)$/,
        include: [resolve(rootDir, 'src')],
        use: {
          loader: 'file-loader',
          options: {},
        },
      },
      {
        test: /\.(woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {},
        },
      },
    ],
  },
  resolve: {
    modules: [
      path.resolve(rootDir, 'node_modules'),
      path.resolve(rootDir, 'src'),
    ],
    extensions: [
      '.wasm',
      '.mjs',
      '.js',
      '.jsx',
      '.json',
      '.ts',
      '.tsx',
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          priority: -10,
        },
        icons: {
          name: 'icons',
          test: /[\\/]static\/icons[\\/]/,
        },
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin(globals),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  node: {
    fs: 'empty',
    module: 'empty',
    tls: 'empty',
  },
};
