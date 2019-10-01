const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const common = require('./webpack.common.js');

const isDev = !(process.env.NODE_ENV === 'production');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    historyApiFallback: true,
    hot: true,
    port: 3000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      templateContent: `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
            </head>
            <body>
              <div id="root"></div>
            </body>
          </html>
        `,
      meta: {
        viewport: 'width=device-width, initial-scale=1',
      },
      title: '',
      filename: 'index.html',
      minify: {
        useShortDoctype: true,
        keepClosingSlash: true,
        collapseWhitespace: true,
        preserveLineBreaks: true,
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
    new WriteFilePlugin(),
  ],
});
