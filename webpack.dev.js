// webpack.dev.js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const dotenv = require('dotenv');

const env = dotenv.config().parsed;
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = common.map((config) => merge(config, {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin(envKeys),
  ],
}));