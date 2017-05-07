module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: require('path').resolve('build/extension')
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      },
      {
        test: /\.ts?$/,
        loader: 'babel-loader!ts-loader',
        exclude: /node_modules/
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  devtool: 'inline-source-map'
}

if (process.env.npm_lifecycle_event === 'build') {
  const path = require('path');
  const Crx = require("crx-webpack-plugin");

  module.exports.plugins = [
    new Crx({
      keyFile: path.resolve('./key.pem'),
      contentPath: path.resolve('./build/extension'),
      outputPath: path.resolve('./build'),
      name: 'tab-eraser'
    })
  ];
}
