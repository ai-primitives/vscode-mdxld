//@ts-check
'use strict';

const path = require('path');
const webpack = require('webpack');

/** @type {import('webpack').Configuration} */
const config = {
  target: 'webworker', // VS Code web extensions run in webworker context
  entry: './src/web/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist', 'web'),
    filename: 'extension.js',
    libraryTarget: 'commonjs',
    devtoolModuleFilenameTemplate: '../../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode' // Avoid bundling vscode module
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "zlib": require.resolve("browserify-zlib"),
      "url": require.resolve("url/"),
      "assert": require.resolve("assert/"),
      "buffer": require.resolve("buffer/"),
      "path": require.resolve("path-browserify"),
      "process": require.resolve("process/browser")
    },
    alias: {
      'node:stream': 'stream-browserify',
      'node:util': 'util',
      'node:zlib': 'browserify-zlib',
      'node:url': 'url',
      'node:assert': 'assert',
      'node:buffer': 'buffer',
      'node:path': 'path-browserify',
      'node:process': 'process/browser'
    },
    mainFields: ['browser', 'module', 'main']
  },
  module: {
    parser: {
      javascript: {
        commonjsMagicComments: true
      }
    },
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    }),
    new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
      resource.request = resource.request.replace(/^node:/, '');
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  ],
  performance: {
    hints: false
  },
  optimization: {
    minimize: true
  }
};

module.exports = config;
