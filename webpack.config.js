function getStyleUse(bundleFilename) {
  return [
    {
      loader: 'file-loader',
      options: {
        name: bundleFilename,
      },
    },
    { loader: 'extract-loader' },
    { loader: 'css-loader' },
    {
      loader: 'sass-loader',
      options: {
        includePaths: ['./node_modules']
      }
    },
  ];
}

let buildPath = __dirname  + '/src/build';

module.exports = [
  {
    entry: './src/index.scss',
    output: {
      path: buildPath,
      // This is necessary for webpack to compile, but we never reference this js file.
      filename: 'style-bundle-index.js',
    },
    module: {
      rules: [{
        test: /\.scss$/,
        use: getStyleUse('bundle-index.css')
      }]
    },
  },
  {
    entry: "./src/index.js",
    output: {
      path: buildPath,
      filename: "bundle-index.js"
    },
    module: {
      loaders: [{
        test: /\.js$/,
        loader: 'babel-loader',
        query: {presets: ['env']}
      }]
    },
  },
  {
    entry: './src/login.scss',
    output: {
      path: buildPath,
      // This is necessary for webpack to compile, but we never reference this js file.
      filename: 'style-bundle-login.js',
    },
    module: {
      rules: [{
        test: /\.scss$/,
        use: getStyleUse('bundle-login.css')
      }]
    },
  },
  {
    entry: "./src/login.js",
    output: {
      path: buildPath,
      filename: "bundle-login.js"
    },
    module: {
      loaders: [{
        test: /\.js$/,
        loader: 'babel-loader',
        query: {presets: ['env']}
      }]
    },
  },
];