const { resolve } = require('path');
const webpack = require('webpack');
const config = require('config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
      'pk.eyJ1IjoiY2hpZWZrbGVlZiIsImEiOiJjaWhkbnE5cGEwYnltdnFrbHBwaHd0NXhuIn0.SXxGsE9D61dU7gWmWEV71Q',
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
        test: /\.(gif|jpg|jpeg|png)$/,
        include: [resolve(rootDir, 'src')],
        use: {
          loader: 'file-loader',
          options: {},
        },
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'file-loader'],
      },
      {
        test: /\.(woff|woff2|ttf)$/,
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
    new HtmlWebpackPlugin({
      templateContent: `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <title>hello</title>
              <meta charset="utf-8">
              <link
                href="https://fonts.googleapis.com/css?family=Roboto+Mono:100,200,300,400&display=swap"
                rel="stylesheet"
              />
            </head>
            <body>
              <div id="root"></div>
            </body>
          </html>
        `,
      meta: {
        viewport:
          'width=device-width, initial-scale=1, user-scalable=no',
      },
      title: '',
      filename: 'index.html',
      favicon: './favicon.png',
      minify: {
        useShortDoctype: true,
        keepClosingSlash: true,
        collapseWhitespace: true,
        preserveLineBreaks: true,
      },
    }),
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
    net: 'empty',
  },
};
