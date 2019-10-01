// const webpack = require("webpack");
const path = require("path");
const merge = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");

const cloudDist = path.resolve(__dirname, "..", "dist/cloud");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const common = require("./webpack.common.js");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(common, {
  mode: "production",
  devtool: "source-map",
  entry: {
    main: path.resolve(__dirname, "..", "src", "index.jsx")
  },
  output: {
    path: cloudDist,
    filename: "[name].[contenthash:8].js",
    chunkFilename: "[name].[contenthash:8].chunk.js",
    publicPath: "/"
  },
  optimization: {
    minimizer: [new TerserPlugin({ parallel: true, sourceMap: true })]
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
        viewport: "width=device-width, initial-scale=1"
      },
      title: "",
      filename: "index.html",
      minify: {
        useShortDoctype: true,
        keepClosingSlash: true,
        collapseWhitespace: true,
        preserveLineBreaks: true
      }
    })
  ]
});
