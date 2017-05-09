const path = require('path');

const ENTRY_POINT = path.join(path.resolve('./src'), 'index.ts');
const BUILD_PATH = path.join(path.resolve('.', 'build', 'extension'));

module.exports = {
  entry: ENTRY_POINT,
  output: {
    filename: 'bundle.js',
    path: BUILD_PATH
  },
  module: {
    rules: [
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
