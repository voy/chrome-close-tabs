const path = require('path');

const SOURCE_DIR = path.resolve('./src');
const BACKGROUND_PAGE = path.join(SOURCE_DIR, 'index.ts');
const CONTENT_SCRIPT = path.join(SOURCE_DIR, 'contentScript.ts');
const BUILD_PATH = path.join(path.resolve('.', 'build', 'extension'));

module.exports = {
  entry: {
    bundle: BACKGROUND_PAGE,
    content_script: CONTENT_SCRIPT
  },
  output: {
    filename: '[name].js',
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
