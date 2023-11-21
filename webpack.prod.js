const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = common.map((config) => merge(config, {
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: true, // Note `mangle.properties` is `false` by default.
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          output: {
            beautify: false,
          },
        },
      }),
    ],
  },
}));